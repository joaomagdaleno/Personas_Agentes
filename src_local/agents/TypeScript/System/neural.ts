import { BaseActivePersona, AuditRule, StrategicFinding } from "../../base.ts";
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

    getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: ['.ts', '.tsx'],
            rules: [
                { regex: /sk-[a-zA-Z0-9]{20,}/, issue: 'Crítico: Chave OpenAI exposta no código-fonte.', severity: 'critical' },
                { regex: /OPENAI_API_KEY\s*[:=]\s*["']/, issue: 'Vazamento: OPENAI_API_KEY hardcoded.', severity: 'critical' },
                { regex: /ANTHROPIC_API_KEY\s*[:=]\s*["']/, issue: 'Vazamento: ANTHROPIC_API_KEY hardcoded.', severity: 'critical' },
                { regex: /model\s*[:=]\s*["']gpt-4/, issue: 'Custo: Modelo GPT-4 sem limite de tokens — risco de custo descontrolado.', severity: 'medium' },
                { regex: /max_tokens\s*[:=]\s*(?:undefined|null|0)/, issue: 'Sem Limite: Requisição à LLM sem max_tokens definido.', severity: 'high' },
                { regex: /temperature\s*[:=]\s*(?:1\.\d|2)/, issue: 'Instabilidade: Temperature alta (>1.0) gera respostas imprevisíveis.', severity: 'low' },
            ]
        };
    }

    reasonAboutObjective(objective: string, file: string, content: string | Promise<string | null>): StrategicFinding | string | null {
        if (typeof content !== 'string') return null;
        if (file.includes('persona_manifest')) return null;
        if (/sk-[a-zA-Z0-9]{20}|OPENAI_API_KEY\s*[:=]\s*['"]/.test(content)) {
            return {
                file, severity: "CRITICAL",
                issue: `Risco de Autonomia: O objetivo '${objective}' exige segurança de tokens. Em '${file}', a exposição de chaves AI compromete a soberania da 'Orquestração de Inteligência Artificial'.`,
                context: "AI Key pattern detected"
            };
        }
        return {
            file, severity: "INFO",
            issue: `PhD Neural: Analisando segurança da IA para ${objective}. Focando em proteção de chaves e controle de custos LLM.`,
            context: "analyzing AI security"
        };
    }

    selfDiagnostic(): any {
        return {
            status: "Soberano",
            score: 100,
            details: "Guardião da inteligência artificial TS operando com segurança PhD."
        };
    }

    getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, mestre em segurança de IA e gestão de tokens TypeScript.`;
    }
}
