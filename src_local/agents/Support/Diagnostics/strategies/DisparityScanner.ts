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
        const entries = await readdir(dir, { withFileTypes: true });
        const nested = await Promise.all(entries.map(e => this.processEntry(dir, e, root, isLegacy, ignoreList)));
        return nested.flat().filter((x): x is FileAnalysis => x !== null);
    }

    private async processEntry(dir: string, ent: any, root: string, isLegacy: boolean, ignoreList: string[]): Promise<FileAnalysis | FileAnalysis[] | null> {
        const full = join(dir, ent.name);
        if (ent.isDirectory()) return this.handleDir(ent, full, root, isLegacy, ignoreList);
        return this.handleFile(ent, full, root, isLegacy, ignoreList);
    }

    private async handleDir(ent: any, full: string, root: string, isLegacy: boolean, ignoreList: string[]): Promise<FileAnalysis[] | null> {
        if (!this.shouldScanDir(ent.name)) return null;
        return this.scanDir(full, root, isLegacy, ignoreList);
    }

    private async handleFile(ent: any, full: string, root: string, isLegacy: boolean, ignoreList: string[]): Promise<FileAnalysis | null> {
        if (!this.shouldScanFile(ent.name, isLegacy, ignoreList)) return null;
        const rel = relative(root, full).replace(/\\/g, "/");
        const content = await readFile(full, "utf-8");
        return {
            path: rel,
            units: isLegacy ? await PythonParser.parse(content, full) : await TypescriptParser.parse(content, full)
        };
    }

    private shouldScanDir(name: string): boolean {
        return !name.match(/^(__pycache__|node_modules|\.)/);
    }

    private shouldScanFile(name: string, isLegacy: boolean, ignoreList: string[]): boolean {
        const ext = isLegacy ? ".py" : ".ts";
        return name.endsWith(ext) && !ignoreList.includes(name);
    }

    compare(legacy: FileAnalysis[], restore: FileAnalysis[], mappings: Record<string, string>): { missingFiles: number, gaps: number, reportLines: string[] } {
        let mF = 0, mG = 0;

        legacy.forEach(l => {
            const t = this.findMatchingFile(l, restore, mappings);
            if (!t) {
                mF++;
            } else {
                mG += this.countGaps(l, t);
            }
        });

        const report = [`- Legacy Files: ${legacy.length}`, `- Missing: ${mF}`, `- Gaps: ${mG}`];
        return { missingFiles: mF, gaps: mG, reportLines: report };
    }

    private findMatchingFile(l: FileAnalysis, restore: FileAnalysis[], mappings: Record<string, string>): FileAnalysis | undefined {
        const lName = basename(l.path);
        const tPath = mappings[lName] || lName.replace(".py", ".ts").toLowerCase();
        return restore.find(f => f.path.endsWith(tPath));
    }

    private countGaps(l: FileAnalysis, t: FileAnalysis): number {
        const legacyMethods = l.units.filter(u => u.type === "method" && !u.name.startsWith("__"));
        const gaps = legacyMethods.filter(lm => !this.hasMatch(lm, t.units));
        return gaps.length;
    }

    private hasMatch(lm: AtomicUnit, units: AtomicUnit[]): boolean {
        const camelName = lm.name.replace(/_([a-z])/g, (_, g1) => (g1 || "").toUpperCase());
        return units.some(tm => tm.name === lm.name || tm.name === camelName);
    }
}
