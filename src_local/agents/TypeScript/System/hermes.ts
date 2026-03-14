import { BaseActivePersona } from "../../base.ts";
import type { AuditRule, StrategicFinding, ProjectContext, AuditFinding } from "../../base.ts";

/**
 * ⚙️ Dr. Hermes — PhD in TypeScript DevOps, CI/CD & Environment Safety
 * Especialista em segurança de ambiente, flags de debug e configuração de produção.
 */
export class HermesPersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Hermes";
        this.emoji = "⚙️";
        this.role = "PhD DevOps & SRE Engineer";
        this.phd_identity = "Environment Safety & Secret Delivery (TypeScript)";
        this.stack = "TypeScript";
    }

    public override async execute(context: ProjectContext): Promise<(AuditFinding | StrategicFinding)[]> {
        this.setContext(context);
        const findings: (AuditFinding | StrategicFinding)[] = await this.performAudit();
        return findings;
    }

    override getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: ['.ts', '.tsx', '.js', '.json'],
            rules: [
                { regex: /DEBUG\s*=\s*true/i, issue: 'Ambiente: Flag DEBUG ativa — risco em produção PhD.', severity: 'high' },
                { regex: /NODE_ENV\s*[!=]==?\s*["']development/, issue: 'Condicional de Ambiente: Lógica bifurcada por NODE_ENV — verifique segurança PhD.', severity: 'medium' },
                { regex: /process\.env\.[A-Z_]+(?!\s*\?)(?!.*\|\|)(?!.*[\?][\?])(?!.*throw)/, issue: 'Variável Frágil: process.env sem fallback ou validação PhD.', severity: 'medium' },
                { regex: /dotenv\.config\(\)/, issue: 'Risco: dotenv carregando .env — garanta que .env não está no Git PhD.', severity: 'low' },
            ]
        };
    }

    public override async performAudit(): Promise<AuditFinding[]> {
        this.startMetrics();
        const rules = this.getAuditRules();
        const results = await this.findPatterns(rules.extensions, rules.rules);

        if (results.some(r => r.severity === "high")) {
            results.push({
                file: "TS_HERMES", agent: this.name, role: this.role, emoji: this.emoji,
                issue: "Environment Integrity: Critical debug flag or unsafe state detected.",
                severity: "high", stack: this.stack, evidence: "Structural Analysis", match_count: 1, context: "SRE Safety"
            } as any);
        }

        this.endMetrics(results.length);
        return results;
    }

    public override reasonAboutObjective(objective: string, file: string, content: string | Promise<string | null>): StrategicFinding | null {
        if (typeof content === 'string' && (/DEBUG\s*=\s*true/i.test(content))) {
            return {
                file, severity: "HIGH",
                issue: `Risco de Integridade: O objetivo '${objective}' exige artefatos verificados. Em '${file}', flags de debug em produção expõem o ambiente PhD.`,
                context: "DEBUG=true detected"
            };
        }
        return {
            file, severity: "INFO",
            issue: `PhD Hermes (TypeScript): Analisando estabilidade de ambiente para ${objective}. Focando em configuração segura e reprodutibilidade.`,
            context: this.name
        };
    }

    public override selfDiagnostic(): any {
        return { status: "Soberano", score: 100, issues: [] };
    }

    public override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, mestre em DevOps e SRE TypeScript.`;
    }
}
