import winston from "winston";
import { Path } from "./path_utils.ts";
import * as ts from "typescript";

const logger = winston.child({ module: "AuditHelpers" });

export class AuditHelpers {
    static async enrichSingleFile(f: string, findings: any[], root: Path, orc: any): Promise<void> {
        const content = await Bun.file(root.join(f).toString()).text();
        if (f.match(/\.ts$|\.tsx$/)) {
            const { LogicAuditor } = await import("../agents/Support/Analysis/logic_auditor.ts");
            findings.push(...LogicAuditor.scanFile(ts.createSourceFile(f, content, ts.ScriptTarget.Latest, true)));
        } else if (f.endsWith(".md")) {
            const { MarkdownAuditor } = await import("../agents/Support/Reporting/markdown_auditor.ts");
            findings.push(...MarkdownAuditor.auditMarkdown(f, content));
        }
        const cog = await (await import("../agents/Support/Diagnostics/cognitive_analyst.ts")).CognitiveAnalyst.analyzeIntent(f, content, orc);
        if (cog) findings.push(cog);
    }

    static async scanFileObfuscation(f: string, hunter: any, root: Path): Promise<any[]> {
        if (f.match(/\.ts$|\.js$|\.py$/) && await Bun.file(root.join(f).toString()).exists()) {
            const c = await Bun.file(root.join(f).toString()).text();
            return (await hunter.scanFile(f, c)).map((fi: any) => ({ ...fi, file: f }));
        }
        return [];
    }

    static async scanTs(content: string, f: string): Promise<any[]> {
        const { LogicAuditor } = await import("../agents/Support/Analysis/logic_auditor.ts");
        return LogicAuditor.scanFile(ts.createSourceFile(f, content, ts.ScriptTarget.Latest, true));
    }

    static async scanMd(content: string, f: string): Promise<any[]> {
        const { MarkdownAuditor } = await import("../agents/Support/Reporting/markdown_auditor.ts");
        return MarkdownAuditor.auditMarkdown(f, content);
    }
}
