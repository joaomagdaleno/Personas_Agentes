import type { AuditFinding } from "../../base.ts";

/**
 * 🔒 StrictAuditHelpers - PhD in Config Compliance
 */
export class StrictAuditHelpers {
    static auditTSConfig(content: string, results: AuditFinding[], filePath: string, persona: string) {
        try {
            const config = JSON.parse(content);
            const co = config.compilerOptions || {};
            this.checkCore(co, results, filePath, persona);
            this.checkAux(co, results, filePath, persona);
        } catch { /* invalid */ }
    }

    private static checkCore(co: Record<string, any>, results: AuditFinding[], f: string, p: string) {
        if (!co.strict) results.push({ file: f, issue: 'Critical: "strict" off.', severity: 'critical', persona: p } as any);
        if (co.noImplicitAny === false) results.push({ file: f, issue: 'High: "noImplicitAny" off.', severity: 'high', persona: p } as any);
        if (co.strictNullChecks === false) results.push({ file: f, issue: 'High: "strictNullChecks" off.', severity: 'high', persona: p } as any);
    }

    private static checkAux(co: Record<string, any>, results: AuditFinding[], f: string, p: string) {
        if (co.noUncheckedIndexedAccess !== true) results.push({ file: f, issue: 'Med: "noUncheckedIndexedAccess" off.', severity: 'medium', persona: p } as any);
        if (co.skipLibCheck === true) results.push({ file: f, issue: 'Med: "skipLibCheck" on.', severity: 'medium', persona: p } as any);
    }

    static detectSuppressions(content: string, results: AuditFinding[], filePath: string, persona: string) {
        const suppressions = (content.match(/@ts-ignore|@ts-nocheck/g) || []).length;
        if (suppressions > 0) results.push({ file: filePath, issue: `High: ${suppressions}x supressions.`, severity: 'high', persona: persona } as any);
    }
}
