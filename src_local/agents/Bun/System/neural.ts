import { BaseActivePersona, AuditRule, StrategicFinding } from "../../base.ts";
import winston from "winston";

const logger = winston.child({ module: "Bun_Neural" });

/**
 * 🧠 Dr. Neural — PhD in Bun AI Safety & LLM Integration
 * Especialista em segurança de tokens AI no Bun, chaves LLM e limites de custo.
 */
export class NeuralPersona extends BaseActivePersona {
    constructor(projectRoot: string | null = null) {
        super(projectRoot);
        this.name = "Neural";
        this.emoji = "🧠";
        this.role = "PhD Bun AI Safety Engineer";
        this.stack = "Bun";
    }

    getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: ['.ts', '.tsx'],
            rules: [
                { regex: /sk-[a-zA-Z0-9]{20,}/, issue: 'Crítico: Chave OpenAI exposta no Bun.', severity: 'critical' },
                { regex: /OPENAI_API_KEY\s*[:=]\s*["']/, issue: 'Vazamento: OPENAI_API_KEY hardcoded no Bun.', severity: 'critical' },
                { regex: /model\s*[:=]\s*["']gpt-4/, issue: 'Custo: GPT-4 sem limite de tokens no Bun.', severity: 'medium' },
                { regex: /max_tokens\s*[:=]\s*(?:undefined|null)/, issue: 'Sem Limite: LLM sem max_tokens no Bun.', severity: 'high' },
            ]
        };
    }

    reasonAboutObjective(objective: string, file: string, content: string | Promise<string | null>): StrategicFinding | string | null {
        if (typeof content !== 'string') return null;
        if (/sk-[a-zA-Z0-9]{20}|OPENAI_API_KEY\s*[:=]\s*['"]/.test(content)) {
            return {
                file, severity: "CRITICAL",
                issue: `Risco AI: O objetivo '${objective}' exige segurança de tokens. Em '${file}', chaves AI expostas no Bun comprometem a soberania.`,
                context: "AI key detected"
            };
        }
        return null;
    }

    getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, mestre em segurança AI e gestão de tokens Bun.`;
    }
}
