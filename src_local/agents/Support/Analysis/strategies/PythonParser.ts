import * as cp from "child_process";
import * as path from "path";
import * as fs from "fs";

export interface PythonAnalysis {
    functions: string[];
    classes: string[];
    tree: boolean | null;
}

export class PythonParser {
    private static BINARY_PATH = path.resolve(process.cwd(), "src_native/analyzer/target/release/analyzer.exe");

    static analyze(content: string): PythonAnalysis {
        const functions = [...content.matchAll(/def\s+(\w+)\s*\(/g)].map(m => m[1] || '');
        const classes = [...content.matchAll(/class\s+(\w+)\s*[:\(]/g)].map(m => m[1] || '');
        return { functions, classes, tree: true };
    }

    static calculateComplexity(content: string): number {
        this.ensureBinaryPresence();

        try {
            // Write temp file for analysis
            const tmpDir = path.join(process.cwd(), "tmp_rust");
            if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);
            const tmpFile = path.join(tmpDir, `tmp_complexity_${Date.now()}.py`);
            fs.writeFileSync(tmpFile, content);

            // Execute native analyzer
            const output = cp.execSync(`"${this.BINARY_PATH}" analyze "${tmpFile}"`, { encoding: 'utf8' });
            fs.unlinkSync(tmpFile);

            const result = JSON.parse(output);
            return result.total_complexity || 1;
        } catch (err) {
            console.error(`[PythonParser] Native complexity calculation failed:`, err);
            return 1; // Fallback to minimum
        }
    }

    static extractImports(content: string): string[] {
        const imports: string[] = [];
        const lines = content.split('\n');
        for (const line of lines) {
            const t = line.trim();
            if (!t || t.startsWith('#')) continue;
            if (t.startsWith('import ')) {
                t.substring(7).split(',').forEach(s => {
                    const mod = s.trim().split('.')[0];
                    if (mod) imports.push(mod);
                });
            }
            if (t.startsWith('from ')) {
                const match = t.match(/^from\s+([\w.]+)\s+import/);
                const mod = match?.[1]?.split('.')[0];
                if (mod) imports.push(mod);
            }
        }
        return [...new Set(imports)];
    }

    private static ensureBinaryPresence() {
        if (!fs.existsSync(this.BINARY_PATH)) {
            console.error(`[FATAL] Rust binary not found at ${this.BINARY_PATH}.`);
            process.exit(1);
        }
    }
}
