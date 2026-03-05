import { BaseActivePersona } from "../../base_persona.ts";
import winston from "winston";

const logger = winston.child({ module: "Bun_Sqlite" });

/**
 * 🗄️ Dr. Sqlite — PhD in bun:sqlite Safety & Query Security
 * Especialista em bun:sqlite, prepared statements e SQL injection.
 */
export class SqlitePersona extends BaseActivePersona {
    constructor(projectRoot: string | null = null) {
        super(projectRoot);
        this.name = "Sqlite";
        this.emoji = "🗄️";
        this.role = "PhD Bun SQLite Safety Engineer";
        this.stack = "Bun";
    }

    async performAudit(): Promise<any[]> {
        const start = Date.now();
        logger.info(`[${this.name}] Analisando Segurança bun:sqlite...`);

        const auditRules = this.getSqliteRules();
        const results: any[] = [];

        for (const rule of auditRules) {
            this.auditWithRule(rule, results);
        }

        const duration = (Date.now() - start) / 1000;
        logger.info(`[${this.name}] Auditoria concluída em ${duration.toFixed(4)}s. Achados: ${results.length}`);
        return results;
    }

    private getSqliteRules() {
        return [
            { regex: 'db\\.(?:query|run|exec)\\s*\\(`[^`]*\\$\\{', issue: 'SQL Injection: Template literal em query bun:sqlite — use prepared statements.', severity: 'critical' },
            { regex: 'db\\.(?:query|run|exec)\\s*\\([^)]*\\+', issue: 'SQL Injection: Concatenação em query bun:sqlite — use $params.', severity: 'critical' },
            { regex: 'new\\s+Database\\([^)]*\\)(?![\\s\\S]{0,100}WAL)', issue: 'Performance: bun:sqlite sem WAL mode — use db.exec("PRAGMA journal_mode=WAL").', severity: 'medium' },
            { regex: 'import.*bun:sqlite', issue: 'Info: Uso de bun:sqlite nativo — API exclusiva Bun.', severity: 'low' },
        ];
    }

    private auditWithRule(rule: any, results: any[]) {
        const regex = new RegExp(rule.regex, 'g');
        for (const [filePath, content] of Object.entries(this.contextData)) {
            if (this.shouldAuditFile(filePath)) {
                this.scanContent(filePath, content as string, regex, rule, results);
            }
        }
    }

    private shouldAuditFile(filePath: string): boolean {
        return filePath.endsWith('.ts') || filePath.endsWith('.tsx');
    }

    private scanContent(filePath: string, content: string, regex: RegExp, rule: any, results: any[]) {
        for (const match of content.matchAll(regex)) {
            results.push({
                file: filePath,
                issue: rule.issue,
                severity: rule.severity,
                evidence: match[0].substring(0, 80),
                persona: this.name
            });
        }
    }

    async reasonAboutObjective(objective: string, file: string, content: string): Promise<any | null> {
        if (/db\.(?:query|run|exec)\s*\(`[^`]*\$\{/.test(content) || /db\.(?:query|run|exec)\s*\([^)]*\+/.test(content)) {
            return {
                file, severity: "CRITICAL", persona: this.name,
                issue: `SQL Injection: O objetivo '${objective}' exige segurança de dados. Em '${file}', queries bun:sqlite sem prepared statements permitem injeção.`
            };
        }
        return null;
    }

    getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, mestre em segurança de queries bun:sqlite.`;
    }
}
