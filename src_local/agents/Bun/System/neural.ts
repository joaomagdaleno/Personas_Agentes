import { BaseActivePersona } from "../../base.ts";
import type { AuditFinding, AuditRule, StrategicFinding, ProjectContext } from "../../base.ts";

/**
 * 🧠 Dr. Neural — PhD in Bun AI Safety & LLM Integration
 * Especialista em segurança de tokens AI no Bun, chaves LLM e limites de custo.
 */
export class NeuralPersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Neural";
        this.emoji = "🧠";
        this.role = "PhD Bun AI Safety Engineer";
        this.phd_identity = "AI Token Safety & LLM Integration Strategies (Bun)";
        this.stack = "Bun";
    }

    public override async execute(context: ProjectContext): Promise<(AuditFinding | StrategicFinding)[]> {
        this.setContext(context);
        const findings: (AuditFinding | StrategicFinding)[] = await this.performAudit();
        return findings;
    }

    override getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: ['.ts', '.tsx', '.js'],
            rules: [
                { regex: /sk-[a-zA-Z0-9]{20,}/, issue: 'Crítico: Chave OpenAI exposta no Bun PhD.', severity: 'critical' },
                { regex: /OPENAI_API_KEY\s*[:=]\s*["']/, issue: 'Vazamento: OPENAI_API_KEY hardcoded no Bun PhD.', severity: 'critical' },
                { regex: /model\s*[:=]\s*["']gpt-4/, issue: 'Custo: GPT-4 sem limite de tokens no Bun PhD.', severity: 'medium' },
                { regex: /max_tokens\s*[:=]\s*(?:undefined|null)/, issue: 'Sem Limite: LLM sem max_tokens no Bun PhD.', severity: 'high' },
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
        if (typeof content === 'string' && /sk-[a-zA-Z0-9]{20}|OPENAI_API_KEY\s*[:=]\s*['"]/.test(content)) {
            return {
                file, severity: "CRITICAL",
                issue: `Risco AI: O objetivo '${objective}' exige segurança de tokens. Em '${file}', chaves AI expostas no Bun comprometem a soberania PhD.`,
                context: "AI key detected"
            };
        }
        return {
            file, severity: "INFO",
            issue: `PhD Neural (Bun): Analisando segurança preditiva e integração LLM para ${objective}.`,
            context: this.name
        };
    }

    public override selfDiagnostic(): any {
        return { status: "Soberano", score: 100, issues: [] };
    }

    public override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, mestre em segurança AI e gestão de tokens Bun.`;
    }
}
