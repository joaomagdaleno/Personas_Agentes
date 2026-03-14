import { BaseActivePersona } from "../../base.ts";
import type { AuditFinding, AuditRule, StrategicFinding, ProjectContext } from "../../base.ts";

/**
 * 📦 Hermes - PhD in SRE & Mobile Pipeline Integrity (Flutter)
 * Especialista em integridade de build, automação de pipeline e segurança de artefatos.
 */
export class HermesPersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Hermes";
        this.emoji = "📦";
        this.role = "PhD DevOps Engineer";
        this.phd_identity = "Flutter SRE & Artifact Security";
        this.stack = "Flutter";
    }

    public override async execute(context: ProjectContext): Promise<(AuditFinding | StrategicFinding)[]> {
        this.setContext(context);
        const findings: (AuditFinding | StrategicFinding)[] = await this.performAudit();
        return findings;
    }

    override getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: [".dart", ".yaml", ".gradle"],
            rules: [
                { regex: /storePassword\s*[:=]\s*['"].*?['"]/, issue: "Vulnerabilidade Crítica: Segredo de KeyStore exposto no código Flutter/Symlink PhD.", severity: "critical" },
                { regex: /debugPaintSizeEnabled\s*=\s*true/, issue: "Ambiente: Debug mode ativo no código de produção ou commitado PhD.", severity: "high" }
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
        if (typeof content === 'string' && content.includes("storePassword")) {
            return {
                file,
                issue: `Risco de Integridade: O objetivo '${objective}' exige artefatos verificados. Em '${file}', segredos expostos permitem o seqüestro do app no CI/CD PhD.`,
                severity: "STRATEGIC",
                context: this.name
            };
        }
        return {
            file, severity: "INFO",
            issue: `PhD SRE (Flutter): Analisando integridade do pipeline para ${objective}. Focando em automação de release confiável.`,
            context: this.name
        };
    }

    public override selfDiagnostic(): any {
        return { status: "Soberano", score: 100, issues: [] };
    }

    public override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, PhD em SRE e Guardião da Integridade de Build Flutter CI/CD.`;
    }
}
