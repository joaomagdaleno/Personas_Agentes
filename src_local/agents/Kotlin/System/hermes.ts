import { BaseActivePersona } from "../../base.ts";
import type { AuditFinding, AuditRule, StrategicFinding, ProjectContext } from "../../base.ts";

/**
 * 📦 Hermes - PhD in Software Reliability & Release Architecture (Kotlin)
 * Guardião da integridade do pipeline Android, especialista em Gradle, ofuscação (R8/ProGuard) e segurança de artefatos.
 */
export class HermesPersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Hermes";
        this.emoji = "📦";
        this.role = "PhD Release Architect";
        this.phd_identity = "Software Reliability & CI/CD Pipeline Shielding (Kotlin)";
        this.stack = "Kotlin";
    }

    public override async execute(context: ProjectContext): Promise<(AuditFinding | StrategicFinding)[]> {
        this.setContext(context);
        const findings: (AuditFinding | StrategicFinding)[] = await this.performAudit();
        return findings;
    }

    override getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: [".kts", ".gradle"],
            rules: [
                { regex: /storePassword\s*=\s*["\'].*?["\']/, issue: "Vulnerabilidade Crítica: Segredo de KeyStore exposto no script de build Gradle PhD.", severity: "critical" },
                { regex: /minifyEnabled\s+false/, issue: "Ofuscação Desativada: Binário vulnerável a engenharia reversa. Habilite R8 PhD.", severity: "high" }
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
                issue: `Risco de Release: O objetivo '${objective}' exige artefatos verificados. Segredos expostos em '${file}' comprometem a cadeia de suprimento PhD.`,
                severity: "STRATEGIC",
                context: this.name
            };
        }
        return {
            file, severity: "INFO",
            issue: `PhD SRE (Kotlin): Analisando confiabilidade de software para ${objective}. Focando em segurança de build e integridade de artefatos mobile.`,
            context: this.name
        };
    }

    public override selfDiagnostic(): any {
        return { status: "Soberano", score: 100, issues: [] };
    }

    public override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, PhD em Arquitetura de Release e Guardião da Integridade Gradle/Kotlin.`;
    }
}
