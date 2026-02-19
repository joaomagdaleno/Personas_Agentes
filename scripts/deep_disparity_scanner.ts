import { readdir, readFile } from "fs/promises";
import { join, relative, basename } from "path";
import * as ts from "typescript";
import winston from "winston";

const LEGACY_ROOT = join(process.cwd(), "legacy_restore"), RESTORE_ROOT = join(process.cwd(), "src_local"), REPORT_FILE = "deep_disparity_report.md";
const logger = winston.createLogger({ level: "info", format: winston.format.simple(), transports: [new winston.transports.Console()] });

const FILE_MAPPINGS: Record<string, string> = { "structural_analyst.py": "agents/Support/structural_analyst.ts", "integrity_guardian.py": "agents/Support/integrity_guardian.ts" };
const IGNORE_LIST = ["__init__.py", "setup.py", "requirements.txt"];

interface AtomicUnit { type: "class" | "function" | "method"; name: string; parent?: string; line?: number; }
interface FileAnalysis { path: string; units: AtomicUnit[]; }

export class DisparityParser {
    static python(content: string): AtomicUnit[] {
        const units: AtomicUnit[] = []; let curClass: string | null = null, curInd = 0;
        content.split("\n").forEach((line, i) => {
            const cM = line.match(/^(\s*)class\s+(\w+)/), dM = line.match(/^(\s*)def\s+(\w+)/);
            if (cM) { curInd = cM[1].length; curClass = cM[2]; units.push({ type: "class", name: curClass, line: i + 1 }); }
            else if (dM) {
                const ind = dM[1].length, name = dM[2];
                if (curClass && ind > curInd) units.push({ type: "method", name: name, parent: curClass, line: i + 1 });
                else { if (curClass && ind <= curInd) curClass = null; units.push({ type: "function", name: name, line: i + 1 }); }
            }
        });
        return units;
    }
    static typescript(content: string, filePath: string): AtomicUnit[] {
        const units: AtomicUnit[] = [], src = ts.createSourceFile(filePath, content, ts.ScriptTarget.Latest, true);
        const visit = (n: ts.Node) => {
            if (ts.isClassDeclaration(n) && n.name) {
                units.push({ type: "class", name: n.name.text });
                n.members.forEach(m => ts.isMethodDeclaration(m) && m.name && ts.isIdentifier(m.name) && units.push({ type: "method", name: m.name.text, parent: n.name!.text }));
            } else if (ts.isFunctionDeclaration(n) && n.name) units.push({ type: "function", name: n.name.text });
            ts.forEachChild(n, visit);
        };
        visit(src); return units;
    }
}

async function scanDir(dir: string, root: string, isLegacy: boolean): Promise<FileAnalysis[]> {
    const res: FileAnalysis[] = [];
    for (const ent of await readdir(dir, { withFileTypes: true })) {
        const full = join(dir, ent.name), rel = relative(root, full).replace(/\\/g, "/");
        if (ent.isDirectory() && !ent.name.match(/^(__pycache__|node_modules|\.)/)) res.push(...await scanDir(full, root, isLegacy));
        else if (ent.name.endsWith(isLegacy ? ".py" : ".ts") && !IGNORE_LIST.includes(ent.name)) res.push({ path: rel, units: isLegacy ? DisparityParser.python(await readFile(full, "utf-8")) : DisparityParser.typescript(await readFile(full, "utf-8"), full) });
    }
    return res;
}

async function main() {
    const legacy = await scanDir(LEGACY_ROOT, LEGACY_ROOT, true), restore = await scanDir(RESTORE_ROOT, RESTORE_ROOT, false), report: string[] = ["# 🔬 Disparity Report", `Generated: ${new Date().toISOString()}`, ""];
    let mF = 0, mG = 0;
    legacy.forEach(l => {
        const lName = basename(l.path), tPath = FILE_MAPPINGS[lName] || lName.replace(".py", ".ts").toLowerCase();
        const t = restore.find(f => f.path.endsWith(tPath));
        if (!t) mF++;
        else {
            const gaps = l.units.filter(u => u.type === "method" && !u.name.startsWith("__")).filter(lm => !t.units.some(tm => tm.name === lm.name || tm.name === lm.name.replace(/_([a-z])/g, g => g[1].toUpperCase())));
            if (gaps.length) mG += gaps.length;
        }
    });
    report.push(`- Legacy Files: ${legacy.length}`, `- Missing: ${mF}`, `- Gaps: ${mG}`);
    await Bun.write(REPORT_FILE, report.join("\n")); logger.info(`✅ Report written to ${REPORT_FILE}`);
}
main();
