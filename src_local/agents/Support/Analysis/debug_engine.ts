import * as ts from "typescript";
import * as fs from "node:fs";
import { LogicAuditor } from "./logic_auditor.ts";

/**
 * 🛠️ DebugEngine — Consolida lógica de scan e diagnóstico.
 * Reduz complexidade em scripts de suporte.
 */
export class DebugEngine {
    /**
     * Traces a file for logic issues using LogicAuditor.
     */
    static trace_file(filePath: string): any[] {
        if (!fs.existsSync(filePath)) {
            console.error(`❌ File not found: ${filePath}`);
            return [];
        }
        const content = fs.readFileSync(filePath, "utf-8");
        const sourceFile = ts.createSourceFile(filePath, content, ts.ScriptTarget.Latest, true);
        return LogicAuditor.scanFile(sourceFile);
    }
}
