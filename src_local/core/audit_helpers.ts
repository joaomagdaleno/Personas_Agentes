import winston from "winston";
import { Path } from "./path_utils.ts";
import * as ts from "typescript";

const logger = winston.child({ module: "AuditHelpers" });

export class AuditHelpers {
    static async enrichSingleFile(f: string, findings: any[], root: Path, orc: any): Promise<void> {
        const norm = f.replace(/\\/g, "/");
        const IGNORED_PREFIXES = [
            "node_modules/",
            "deepseek-harness/",
            ".opencode/",
            ".git/",
            "dist/",
            "bin/",
            "obj/",
            "target/",
            "tmp/",
            ".gemini/",
            ".sovereign_cache",
            ".psa_sessions",
            ".system_generated"
        ];
        if (IGNORED_PREFIXES.some(prefix => norm.startsWith(prefix) || norm.includes("/" + prefix))) {
            return;
        }

        const filePath = root.join(f);
        if (!(await filePath.exists())) return;

        const content = await Bun.file(filePath.toString()).text();
        if (f.match(/\.ts$|\.tsx$/)) {
            const { LogicAuditor } = await import("../engines/analysis/logic_auditor.ts");
            const auditor = new LogicAuditor(orc?.hubManager);
            findings.push(...await auditor.scanFile(f, content));
        } else if (f.endsWith(".md")) {
            const { MarkdownAuditor } = await import("../engines/reporting/markdown_auditor.ts");
            findings.push(...MarkdownAuditor.auditMarkdown(f, content));
        }

        const isSovereignScope = norm.startsWith("src_local/agents/") || norm.startsWith("src_local/engines/");
        if (isSovereignScope && orc?.contextEngine?.cognitiveReason) {
            const cog = await (await import("../engines/diagnostics/audit_code_guardian_service.ts")).CognitiveAnalyst.analyzeIntent(f, content, orc);
            if (cog) findings.push(cog);
        }
    }

    static async scanFileObfuscation(f: string, hunter: any, root: Path): Promise<any[]> {
        if (f.match(/\.ts$|\.js$|\.py$/) && await Bun.file(root.join(f).toString()).exists()) {
            const c = await Bun.file(root.join(f).toString()).text();
            return (await hunter.scanFile(f, c)).map((fi: any) => ({ ...fi, file: f }));
        }
        return [];
    }

    static async scanTs(content: string, f: string, hubManager?: any): Promise<any[]> {
        const { LogicAuditor } = await import("../engines/analysis/logic_auditor.ts");
        const auditor = new LogicAuditor(hubManager);
        return await auditor.scanFile(f, content);
    }

    static async scanMd(content: string, f: string): Promise<any[]> {
        const { MarkdownAuditor } = await import("../engines/reporting/markdown_auditor.ts");
        return MarkdownAuditor.auditMarkdown(f, content);
    }

    static formatFindingSummary(finding: any): string {
        return `[${finding.severity || "INFO"}] ${finding.file || "system"}: ${finding.issue || "Finding"}`;
    }
}

export function formatFindingSummary(finding: any): string {
    return AuditHelpers.formatFindingSummary(finding);
}
