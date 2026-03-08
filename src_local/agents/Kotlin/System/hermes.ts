/**
 * 📦 Hermes - PhD in Software Reliability & Release Architecture (Kotlin)
 * Guardião da integridade do pipeline Android, especialista em Gradle, ofuscação (R8/ProGuard) e segurança de artefatos.
 */
import type { AuditFinding, AuditRule, StrategicFinding } from "../../base.ts";
import { BaseActivePersona } from "../../base.ts";

export class HermesPersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Hermes";
        this.emoji = "📦";
        this.role = "PhD Release Architect";
        this.stack = "Kotlin";
    }

    public override async performAudit(): Promise<AuditFinding[]> {
        this.startMetrics();
        const results = await this.findPatterns([".kts", ".gradle"], [
            { regex: /storePassword\s*=\s*["\'].*?["\']/, issue: "Vulnerabilidade Crítica: Segredo de KeyStore exposto no script de build Gradle.", severity: "critical" },
            { regex: /minifyEnabled\s+false/, issue: "Ofuscação Desativada: Binário vulnerável a engenharia reversa. Habilite R8.", severity: "high" }
        ]);
        this.endMetrics(results.length);
        return results;
    }

    public override reasonAboutObjective(objective: string, file: string, content: string): StrategicFinding | null {
        if (content.includes("storePassword")) {
            return {
                file,
                issue: `Risco de Release: O objetivo '${objective}' exige artefatos verificados. Segredos expostos em '${file}' comprometem a cadeia de suprimento.`,
                severity: "STRATEGIC",
                context: this.name
            };
        }
        return `PhD SRE: Analisando confiabilidade de software para ${objective}. Focando em segurança de build e integridade de artefatos mobile.`;
    }

    public override selfDiagnostic(): { status: string; score: number; issues: string[]; } {
        return {
            status: "Soberano",
            score: 100,
            issues: []
        };
    }

    public override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, PhD em Arquitetura de Release e Guardião da Integridade Kotlin.`;
    }
}

