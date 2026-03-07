import * as cp from "child_process";
import * as path from "path";
import * as fs from "fs";

export class PolyglotParser {
    private static GO_BINARY = path.resolve(process.cwd(), "src_native/go-scanner.exe");

    static analyzeKt(content: string) {
        const lines = content.split('\n');
        return {
            imports: lines.filter(l => l.startsWith('import ')).map(l => l.split(/\s+/)[1] || ''),
            functions: [...content.matchAll(/fun\s+(\w+)/g)].map(m => m[1] || ''),
            classes: [...content.matchAll(/class\s+(\w+)/g)].map(m => m[1] || '')
        };
    }

    static calculateKtComplexity(content: string): number {
        return this.callNativeScanner(content, ".kt");
    }

    static analyzeGo(content: string) {
        const functions = [...content.matchAll(/func\s+(?:\([^)]+\)\s+)?(\w+)\s*\(/g)].map(m => m[1] || '');
        const structs = [...content.matchAll(/type\s+(\w+)\s+struct/g)].map(m => m[1] || '');
        return { functions, classes: structs };
    }

    static calculateGoComplexity(content: string): number {
        return this.callNativeScanner(content, ".go");
    }

    private static callNativeScanner(content: string, ext: string): number {
        if (!fs.existsSync(this.GO_BINARY)) return 1;

        try {
            const tmpDir = path.join(process.cwd(), "tmp_native_poly");
            if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);
            const tmpFile = path.join(tmpDir, `tmp_poly_${Date.now()}${ext}`);
            fs.writeFileSync(tmpFile, content);

            const output = cp.execSync(`"${this.GO_BINARY}" -file "${tmpFile}" -root "${process.cwd()}"`, { encoding: 'utf8' });
            fs.unlinkSync(tmpFile);

            const data = JSON.parse(output);
            return data[0]?.total_complexity || 1;
        } catch (err) {
            console.error(`[PolyglotParser] Native calculation failed for ${ext}:`, err);
            return 1;
        }
    }

    static analyzeDart(content: string) {
        const classes = [...content.matchAll(/class\s+(\w+)/g)].map(m => m[1] || '');
        const functions = [...content.matchAll(/(\w+)\s+\w+\s*\(.*?\)\s*{/g)]
            .map(this.extractDartFunctionName)
            .filter(this.isValidDartFunctionName);
        return { functions, classes };
    }

    private static extractDartFunctionName(m: RegExpMatchArray): string {
        const parts = m[0].split(/\s+/);
        return (parts[1] || "").replace('(', '');
    }

    private static isValidDartFunctionName(f: string): boolean {
        return f !== "" && f !== 'if' && f !== 'for';
    }
}
