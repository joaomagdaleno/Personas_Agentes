import { BaseActivePersona } from "../../base_persona.ts";
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

    async performAudit(): Promise<any[]> {
        const start = Date.now();
        logger.info(`[${this.name}] Analisando Segurança AI Bun...`);

        const auditRules = [
            { regex: 'sk-[a-zA-Z0-9]{20,}', issue: 'Crítico: Chave OpenAI exposta no Bun.', severity: 'critical' },
            { regex: 'OPENAI_API_KEY\\s*[:=]\\s*["\']', issue: 'Vazamento: OPENAI_API_KEY hardcoded no Bun.', severity: 'critical' },
            { regex: 'model\\s*[:=]\\s*["\']gpt-4', issue: 'Custo: GPT-4 sem limite de tokens no Bun.', severity: 'medium' },
            { regex: 'max_tokens\\s*[:=]\\s*(?:undefined|null)', issue: 'Sem Limite: LLM sem max_tokens no Bun.', severity: 'high' },
        ];

        const results: any[] = [];
        for (const rule of auditRules) {
            const regex = new RegExp(rule.regex, 'g');
            for (const [filePath, content] of Object.entries(this.contextData)) {
                if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
                    if (filePath.includes('persona_manifest')) continue;
                    for (const match of (content as string).matchAll(regex)) {
                        results.push({ file: filePath, issue: rule.issue, severity: rule.severity, evidence: match[0].substring(0, 30), persona: this.name });
                    }
                }
            }
        }

        const duration = (Date.now() - start) / 1000;
        logger.info(`[${this.name}] Auditoria concluída em ${duration.toFixed(4)}s. Achados: ${results.length}`);
        return results;
    }

    async reasonAboutObjective(objective: string, file: string, content: string): Promise<any | null> {
        if (/sk-[a-zA-Z0-9]{20}|OPENAI_API_KEY\s*[:=]\s*['"]/.test(content)) {
            return {
                file, severity: "CRITICAL", persona: this.name,
                issue: `Risco AI: O objetivo '${objective}' exige segurança de tokens. Em '${file}', chaves AI expostas no Bun comprometem a soberania.`
            };
        }
        return null;
    }

    getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, mestre em segurança AI e gestão de tokens Bun.`;
    }
}
