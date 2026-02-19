import { readdir, readFile } from "fs/promises";
import { join, relative, basename } from "path";
import * as ts from "typescript";
import winston from "winston";

import { PythonParser } from "./parsers/PythonParser.ts";
import { TypescriptParser } from "./parsers/TypescriptParser.ts";

const logger = winston.createLogger({ level: "info", format: winston.format.simple(), transports: [new winston.transports.Console()] });

export interface AtomicUnit { type: "class" | "function" | "method"; name: string; parent?: string; line?: number; }
export interface FileAnalysis { path: string; units: AtomicUnit[]; }

export class DisparityScanner {
    async scanDir(dir: string, root: string, isLegacy: boolean, ignoreList: string[]): Promise<FileAnalysis[]> {
        const res: FileAnalysis[] = [];
        for (const ent of await readdir(dir, { withFileTypes: true })) {
            const full = join(dir, ent.name), rel = relative(root, full).replace(/\\/g, "/");
            if (ent.isDirectory() && !ent.name.match(/^(__pycache__|node_modules|\.)/)) res.push(...await this.scanDir(full, root, isLegacy, ignoreList));
            else if (ent.name.endsWith(isLegacy ? ".py" : ".ts") && !ignoreList.includes(ent.name)) {
                const content = await readFile(full, "utf-8");
                res.push({
                    path: rel,
                    units: isLegacy ? PythonParser.parse(content) : TypescriptParser.parse(content, full)
                });
            }
        }
        return res;
    }

    compare(legacy: FileAnalysis[], restore: FileAnalysis[], mappings: Record<string, string>): { missingFiles: number, gaps: number, reportLines: string[] } {
        const report: string[] = [];
        let mF = 0, mG = 0;
        legacy.forEach(l => {
            const lName = basename(l.path), tPath = mappings[lName] || lName.replace(".py", ".ts").toLowerCase();
            const t = restore.find(f => f.path.endsWith(tPath));
            if (!t) mF++;
            else {
                const gaps = l.units.filter(u => u.type === "method" && !u.name.startsWith("__")).filter(lm => !t.units.some(tm => tm.name === lm.name || tm.name === lm.name.replace(/_([a-z])/g, (_, g1) => (g1 || "").toUpperCase())));
                if (gaps.length) mG += gaps.length;
            }
        });
        report.push(`- Legacy Files: ${legacy.length}`, `- Missing: ${mF}`, `- Gaps: ${mG}`);
        return { missingFiles: mF, gaps: mG, reportLines: report };
    }
}
