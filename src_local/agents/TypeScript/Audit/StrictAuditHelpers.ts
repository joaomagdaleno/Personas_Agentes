/**
 * 🔒 StrictAuditHelpers - PhD in Config Compliance
 */
export class StrictAuditHelpers {
    static auditTSConfig(content: string, results: any[], filePath: string, persona: string) {
        try {
            const config = JSON.parse(content), co = config.compilerOptions || {};
            this.checkCore(co, results, filePath, persona);
            this.checkAux(co, results, filePath, persona);
        } catch { /* invalid */ }
    }

    private static checkCore(co: any, results: any[], f: string, p: string) {
        if (!co.strict) results.push({ file: f, issue: 'Critical: "strict" off.', severity: 'critical', persona: p });
        if (co.noImplicitAny === false) results.push({ file: f, issue: 'High: "noImplicitAny" off.', severity: 'high', persona: p });
        if (co.strictNullChecks === false) results.push({ file: f, issue: 'High: "strictNullChecks" off.', severity: 'high', persona: p });
    }

    private static checkAux(co: any, results: any[], f: string, p: string) {
        if (co.noUncheckedIndexedAccess !== true) results.push({ file: f, issue: 'Med: "noUncheckedIndexedAccess" off.', severity: 'medium', persona: p });
        if (co.skipLibCheck === true) results.push({ file: f, issue: 'Med: "skipLibCheck" on.', severity: 'medium', persona: p });
    }

    static detectSuppressions(content: string, results: any[], filePath: string, persona: string) {
        const suppressions = (content.match(/@ts-ignore|@ts-nocheck/g) || []).length;
        if (suppressions > 0) results.push({ file: filePath, issue: `High: ${suppressions}x supressions.`, severity: 'high', persona: persona });
    }
}
