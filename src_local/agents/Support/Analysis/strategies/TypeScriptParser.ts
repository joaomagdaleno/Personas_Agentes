import * as cp from "child_process";
import * as path from "path";
import * as fs from "fs";
import { ParserHelpers } from "./ParserHelpers.ts";

export interface TypeScriptAnalysis {
    functions: string[];
    classes: string[];
    dependencies: string[];
    complexity: number;
    telemetry: boolean;
    tree: boolean;
}

/**
 * 🟦 TypeScriptParser - PhD in Structural Analysis
 */
export class TypeScriptParser {
    private static BINARY_PATH = path.resolve(process.cwd(), "src_native/analyzer/target/release/analyzer.exe");

    static analyze(content: string): TypeScriptAnalysis {
        const parts = ParserHelpers.getParts(content);
        return {
            functions: [...new Set([...parts.functions, ...parts.arrows, ...parts.methods, ...parts.con])],
            classes: [...new Set(parts.classes)],
            dependencies: this.extractImports(content),
            complexity: this.calculateComplexity(content),
            telemetry: ParserHelpers.checkTelemetry(content),
            tree: true
        };
    }

    static calculateComplexity(content: string): number {
        this.ensureBinaryPresence();

        try {
            // Write temp file for analysis
            const tmpDir = path.join(process.cwd(), "tmp_rust");
            if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);
            const tmpFile = path.join(tmpDir, `tmp_complexity_${Date.now()}.ts`);
            fs.writeFileSync(tmpFile, content);

            // Execute native analyzer
            const output = cp.execSync(`"${this.BINARY_PATH}" analyze "${tmpFile}"`, { encoding: 'utf8' });
            fs.unlinkSync(tmpFile);

            const result = JSON.parse(output);
            return result.total_complexity || 1;
        } catch (err) {
            console.error(`[TypeScriptParser] Native complexity calculation failed:`, err);
            return 1; // Fallback to minimum
        }
    }

    static extractImports(content: string): string[] {
        const matches = content.matchAll(/import\s+(?:\{[^}]*\}|\*\s+as\s+\w+|\w+)\s+from\s+['"]([^'"]+)['"]/g);
        return [...matches].map(m => m[1] || '').filter(Boolean);
    }

    private static ensureBinaryPresence() {
        if (!fs.existsSync(this.BINARY_PATH)) {
            console.error(`[FATAL] Rust binary not found at ${this.BINARY_PATH}.`);
            console.error(`[FATAL] O sistema exige que os binários nativos de Rust estejam compilados.`);
            process.exit(1);
        }
    }
}
