import { BaseActivePersona } from "../../base.ts";
import type { AuditFinding, AuditRule, StrategicFinding, ProjectContext } from "../../base.ts";

/**
 * ⚙️ Dr. Hermes — PhD in Bun DevOps & bunfig.toml Configuration
 * Especialista em bunfig.toml, variáveis de ambiente Bun e CI/CD.
 */
export class HermesPersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Hermes";
        this.emoji = "⚙️";
        this.role = "PhD Bun DevOps Engineer";
        this.phd_identity = "Environment Config (bunfig.toml) & CI/CD Safety";
        this.stack = "Bun";
    }

    public override async execute(context: ProjectContext): Promise<(AuditFinding | StrategicFinding)[]> {
        this.setContext(context);
        const findings: (AuditFinding | StrategicFinding)[] = await this.performAudit();
        return findings;
    }

    override getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: ['.ts', '.tsx', '.toml'],
            rules: [
                { regex: /DEBUG\s*=\s*true/, issue: 'Ambiente: Flag DEBUG ativa no runtime Bun PhD.', severity: 'high' },
                { regex: /Bun\.env\.[A-Z_]+(?!.*\?\?|.*\|\||.*throw)/, issue: 'Frágil: Bun.env sem fallback ou validação PhD.', severity: 'medium' },
                { regex: /NODE_ENV/, issue: 'Legado: NODE_ENV em projeto Bun — considere Bun.env puro PhD.', severity: 'low' },
            ]
        };
    }

    public override async performAudit(): Promise<AuditFinding[]> {
        this.startMetrics();
        const rules = this.getAuditRules();
        const results = await this.findPatterns(rules.extensions, rules.rules);
        this.checkBunfigPresence(results);
        this.endMetrics(results.length);
        return results;
    }

    private checkBunfigPresence(results: AuditFinding[]) {
        if (!this.contextData) return;
        const hasBunfig = Object.keys(this.contextData).some(f => f.endsWith('bunfig.toml'));
        if (!hasBunfig) {
            results.push({
                file: 'ROOT',
                issue: 'Ausência: Projeto sem bunfig.toml — sem configuração otimizada de runtime PhD.',
                severity: 'medium',
                agent: this.name,
                role: this.role,
                emoji: this.emoji,
                stack: this.stack,
                evidence: "Config Check",
                match_count: 1
            });
        }
    }

    public override reasonAboutObjective(objective: string, file: string, content: string | Promise<string | null>): StrategicFinding | null {
        if (typeof content === 'string' && /DEBUG\s*=\s*true/i.test(content)) {
            return {
                file, severity: "HIGH",
                issue: `Risco: O objetivo '${objective}' exige produção limpa. Em '${file}', flags de debug expõem o runtime Bun PhD.`,
                context: "DEBUG=true flag detected"
            };
        }
        return {
            file, severity: "INFO",
            issue: `PhD Hermes (Bun): Monitorando integridade DevOps para ${objective}.`,
            context: this.name
        };
    }

    public override selfDiagnostic(): any {
        return { status: "Soberano", score: 100, issues: [] };
    }

    public override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, mestre em DevOps e configuração bunfig.toml.`;
    }
}
