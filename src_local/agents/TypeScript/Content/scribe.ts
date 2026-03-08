import { BaseActivePersona, AuditRule, StrategicFinding } from "../../base.ts";
import winston from "winston";

const logger = winston.child({ module: "TS_Scribe" });

/**
 * 📝 Dr. Scribe — PhD in TypeScript Documentation & Knowledge
 */
export class ScribePersona extends BaseActivePersona {
    constructor(projectRoot: string | null = null) {
        super(projectRoot);
        this.name = "Scribe";
        this.emoji = "📝";
        this.role = "PhD Documentation Engineer";
        this.stack = "TypeScript";
    }

    getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: ['.ts', '.tsx'],
            rules: [
                { regex: /^export\s+(?:async\s+)?(?:function|class|const|interface|type|enum)\s+\w+/m, issue: 'Amnésia Técnica: Exportação sem JSDoc detectada.', severity: 'high' },
            ]
        };
    }

    reasonAboutObjective(objective: string, file: string, content: string | Promise<string | null>): StrategicFinding | string | null {
        if (typeof content !== 'string') return null;
        const exports = (content.match(/export\s+(?:async\s+)?(?:function|class)\s+\w+/g) || []).length;
        const docs = (content.match(/\/\*\*[\s\S]*?\*\//g) || []).length;

        if (exports > 0 && docs === 0) {
            return {
                file, severity: "HIGH",
                issue: `Amnésia Técnica: O objetivo '${objective}' exige clareza. Em '${file}', a falta de documentação torna a 'Orquestração de Inteligência Artificial' um sistema de caixa preta.`,
                context: "Exports without JSDoc detected"
            };
        }
        return {
            file, severity: "INFO",
            issue: `PhD Scribe: Analisando explicabilidade para ${objective}.`,
            context: "analyzing explicability"
        };
    }

    getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, mestre em documentação e transferência de conhecimento TypeScript.`;
    }
}
