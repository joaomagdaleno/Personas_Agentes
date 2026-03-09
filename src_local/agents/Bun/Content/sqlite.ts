import { BaseActivePersona, AuditRule, StrategicFinding } from "../../base.ts";
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

    getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: ['.ts', '.tsx'],
            rules: [
                { regex: /db\.(?:query|run|exec)\s*\(`[^`]*\$\{/, issue: 'SQL Injection: Template literal em query bun:sqlite — use prepared statements.', severity: 'critical' },
                { regex: /db\.(?:query|run|exec)\s*\([^)]*\+/, issue: 'SQL Injection: Concatenação em query bun:sqlite — use $params.', severity: 'critical' },
                { regex: /new\s+Database\([^)]*\)(?![\s\S]{0,100}WAL)/, issue: 'Performance: bun:sqlite sem WAL mode — use db.exec("PRAGMA journal_mode=WAL").', severity: 'medium' },
                { regex: /import.*bun:sqlite/, issue: 'Info: Uso de bun:sqlite nativo — API exclusiva Bun.', severity: 'low' },
            ]
        };
    }

    reasonAboutObjective(objective: string, file: string, content: string | Promise<string | null>): StrategicFinding | string | null {
        if (typeof content !== 'string') return null;
        if (/db\.(?:query|run|exec)\s*\(`[^`]*\$\{/.test(content) || /db\.(?:query|run|exec)\s*\([^)]*\+/.test(content)) {
            return {
                file, severity: "CRITICAL",
                issue: `SQL Injection: O objetivo '${objective}' exige segurança de dados. Em '${file}', queries bun:sqlite sem prepared statements permitem injeção.`,
                context: "Dynamic SQL detected"
            };
        }
        return null;
    }

    getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, mestre em segurança de queries bun:sqlite.`;
    }
}
