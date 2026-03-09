import { BaseActivePersona, AuditRule, StrategicFinding } from "../../base.ts";
import winston from "winston";

const logger = winston.child({ module: "Bun_Scribe" });

/**
 * 📝 Dr. Scribe — PhD in Bun Documentation & API Clarity
 */
export class ScribePersona extends BaseActivePersona {
    constructor(projectRoot: string | null = null) {
        super(projectRoot);
        this.name = "Scribe";
        this.emoji = "📝";
        this.role = "PhD Bun Documentation Engineer";
        this.stack = "Bun";
    }

    getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: ['.ts', '.tsx'],
            rules: [
                {
                    regex: /^(?:export\s+(?:async\s+)?(?:function|class|const|interface|type|enum)\s+\w+)/m,
                    issue: 'Amnésia: Exportação Bun detectada (verifique se há JSDoc correspondente).',
                    severity: 'high'
                },
            ]
        };
    }

    // Scribe is a bit special as it compares exports with JSDocs,
    // which simple regex auditing doesn't fully capture in a single pass
    // (unless we use complex lookaheads which are fragile).
    // For now, we standardize the audit rules for the exports.

    reasonAboutObjective(objective: string, file: string, content: string | Promise<string | null>): StrategicFinding | string | null {
        if (typeof content !== 'string') return null;
        const exports = (content.match(/export\s+(?:async\s+)?(?:function|class)\s+\w+/g) || []).length;
        const docs = (content.match(/\/\*\*[\s\S]*?\*\//g) || []).length;
        if (exports > 0 && docs === 0) {
            return {
                file, severity: "HIGH", persona: this.name,
                issue: `Caixa Preta: O objetivo '${objective}' exige transparência. Em '${file}', a falta de JSDoc torna o módulo Bun opaco.`
            };
        }
        return null;
    }

    getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, mestre em documentação e clareza de APIs Bun.`;
    }
}
