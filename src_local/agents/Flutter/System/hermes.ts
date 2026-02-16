/**
 * 📦 Hermes - PhD in SRE & Mobile Pipeline Integrity (Flutter)
 * Especialista em integridade de build, automação de pipeline e segurança de artefatos.
 */
import type { AuditFinding, AuditRule, StrategicFinding } from "../../base.ts";
import { BaseActivePersona } from "../../base.ts";

export class HermesPersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Hermes";
        this.emoji = "📦";
        this.role = "PhD DevOps Engineer";
        this.stack = "Flutter";
    }

    public override performAudit(): AuditFinding[] {
        this.startMetrics();
        const results = this.findPatterns([".dart", ".yaml", ".gradle"], [
            { regex: /storePassword\s*[:=]\s*['"].*?['"]/, issue: "Vulnerabilidade Crítica: Segredo de KeyStore exposto no código.", severity: "critical" },
            { regex: /debugPaintSizeEnabled\s*=\s*true/, issue: "Ambiente: Debug mode ativo no código de produção ou commitado.", severity: "high" }
        ]);
        this.endMetrics(results.length);
        return results;
    }

    public override reasonAboutObjective(objective: string, file: string, content: string): StrategicFinding | null {
        if (content.includes("storePassword")) {
            return {
                file,
                issue: `Risco de Integridade: O objetivo '${objective}' exige artefatos verificados. Em '${file}', segredos expostos permitem o seqüestro do app.`,
                severity: "STRATEGIC",
                context: this.name
            };
        }
        return `PhD SRE: Analisando integridade do pipeline para ${objective}. Focando em segurança de segredos e automação de release confiável.`;
    }

    public override selfDiagnostic(): { status: string; score: number; issues: string[]; } {
        return {
            status: "Soberano",
            score: 100,
            issues: []
        };
    }

    public override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, PhD em SRE e Guardião da Integridade de Build Flutter.`;
    }
}
