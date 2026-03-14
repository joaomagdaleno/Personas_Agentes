import { BaseActivePersona } from "../../base.ts";
import type { AuditRule, StrategicFinding, ProjectContext, AuditFinding } from "../../base.ts";

/**
 * 🧠 Dr. Neural — PhD in TypeScript AI/ML Token Safety & LLM Integration
 * Especialista em segurança de tokens AI, exposição de chaves LLM e limites de custo.
 */
export class NeuralPersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Neural";
        this.emoji = "🧠";
        this.role = "PhD AI Safety & Token Engineer";
        this.phd_identity = "AI Token Safety & Cost Management (TypeScript)";
        this.stack = "TypeScript";
    }

    public override async execute(context: ProjectContext): Promise<(AuditFinding | StrategicFinding)[]> {
        this.setContext(context);
        const findings: (AuditFinding | StrategicFinding)[] = await this.performAudit();
        return findings;
    }

    override getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: ['.ts', '.tsx'],
            rules: [
                { regex: /sk-[a-zA-Z0-9]{20,}/, issue: 'Crítico: Chave OpenAI exposta no código-fonte PhD.', severity: 'critical' },
                { regex: /OPENAI_API_KEY\s*[:=]\s*["']/, issue: 'Vazamento: OPENAI_API_KEY hardcoded PhD.', severity: 'critical' },
                { regex: /ANTHROPIC_API_KEY\s*[:=]\s*["']/, issue: 'Vazamento: ANTHROPIC_API_KEY hardcoded PhD.', severity: 'critical' },
                { regex: /model\s*[:=]\s*["']gpt-4/, issue: 'Custo: Modelo GPT-4 sem limite de tokens — risco de custo descontrolado PhD.', severity: 'medium' },
                { regex: /max_tokens\s*[:=]\s*(?:undefined|null|0)/, issue: 'Sem Limite: Requisição à LLM sem max_tokens configurado PhD.', severity: 'high' },
                { regex: /temperature\s*[:=]\s*(?:1\.\d|2)/, issue: 'Instabilidade: Temperature alta (>1.0) gera respostas imprevisíveis PhD.', severity: 'low' },
            ]
        };
    }

    public override async performAudit(): Promise<AuditFinding[]> {
        this.startMetrics();
        const rules = this.getAuditRules();
        const results = await this.findPatterns(rules.extensions, rules.rules);
        this.endMetrics(results.length);
        return results;
    }

    public override reasonAboutObjective(objective: string, file: string, content: string | Promise<string | null>): StrategicFinding | null {
        if (typeof content === 'string' && !file.includes('persona_manifest') && (/sk-[a-zA-Z0-9]{20}|OPENAI_API_KEY\s*[:=]\s*['"]/.test(content))) {
            return {
                file, severity: "CRITICAL",
                issue: `Risco de Autonomia: O objetivo '${objective}' exige proteção de tokens. Em '${file}', chaves criptográficas expõem a arquitetura AI PhD.`,
                context: "AI Key pattern detected"
            };
        }
        return {
            file, severity: "INFO",
            issue: `PhD Neural (TypeScript): Analisando segurança da IA para ${objective}. Focando em proteção de chaves e gestão de LLM.`,
            context: this.name
        };
    }

    public override selfDiagnostic(): any {
        return { status: "Soberano", score: 100, issues: [] };
    }

    public override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, mestre em segurança de IA e gestão de tokens TypeScript.`;
    }
}
