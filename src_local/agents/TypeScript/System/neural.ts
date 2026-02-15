import { BaseActivePersona } from "../../base_persona.ts";
import winston from "winston";

const logger = winston.child({ module: "TS_Neural" });

/**
 * 🧠 Dr. Neural — PhD in TypeScript AI/ML Token Safety & LLM Integration
 * Especialista em segurança de tokens AI, exposição de chaves LLM e limites de custo.
 */
export class NeuralPersona extends BaseActivePersona {
    constructor(projectRoot: string | null = null) {
        super(projectRoot);
        this.name = "Neural";
        this.emoji = "🧠";
        this.role = "PhD AI Safety & Token Engineer";
        this.stack = "TypeScript";
    }

    async performAudit(): Promise<any[]> {
        const start = Date.now();
        logger.info(`[${this.name}] Analisando Segurança AI/ML TypeScript...`);

        const auditRules = [
            { regex: 'sk-[a-zA-Z0-9]{20,}', issue: 'Crítico: Chave OpenAI exposta no código-fonte.', severity: 'critical' },
            { regex: 'OPENAI_API_KEY\\s*[:=]\\s*["\']', issue: 'Vazamento: OPENAI_API_KEY hardcoded.', severity: 'critical' },
            { regex: 'ANTHROPIC_API_KEY\\s*[:=]\\s*["\']', issue: 'Vazamento: ANTHROPIC_API_KEY hardcoded.', severity: 'critical' },
            { regex: 'model\\s*[:=]\\s*["\']gpt-4', issue: 'Custo: Modelo GPT-4 sem limite de tokens — risco de custo descontrolado.', severity: 'medium' },
            { regex: 'max_tokens\\s*[:=]\\s*(?:undefined|null|0)', issue: 'Sem Limite: Requisição à LLM sem max_tokens definido.', severity: 'high' },
            { regex: 'temperature\\s*[:=]\\s*(?:1\\.\\d|2)', issue: 'Instabilidade: Temperature alta (>1.0) gera respostas imprevisíveis.', severity: 'low' },
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
                issue: `Risco de Autonomia: O objetivo '${objective}' exige segurança de tokens. Em '${file}', a exposição de chaves AI compromete a soberania da 'Orquestração de Inteligência Artificial'.`
            };
        }
        return null;
    }

    getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, mestre em segurança de IA e gestão de tokens TypeScript.`;
    }
}
