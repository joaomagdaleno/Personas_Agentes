/**
 * ☁️ Nebula - PhD in Cloud Architecture (Kotlin)
 * Especialista em integração Firebase, segurança de segredos em build.gradle e soberania cloud mobile.
 */
import type { AuditFinding, AuditRule, StrategicFinding } from "../../base.ts";
import { BaseActivePersona } from "../../base.ts";

export class NebulaPersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Nebula";
        this.emoji = "☁️";
        this.role = "PhD Cloud Architect";
        this.stack = "Kotlin";
    }

    public override performAudit(): AuditFinding[] {
        this.startMetrics();
        const results = this.findPatterns([".kt", "build.gradle.kts"], [
            { regex: /AKIA[0-9A-Z]{16}/, issue: "Vulnerabilidade Crítica: Chave AWS exposta no código ou build script.", severity: "critical" },
            { regex: /Firebase\.getInstance\(/, issue: "Aviso: Firebase detectado. Garanta regras de segurança e isolamento de ambiente.", severity: "medium" }
        ]);
        this.endMetrics(results.length);
        return results;
    }

    public override reasonAboutObjective(objective: string, file: string, content: string): StrategicFinding | null {
        if (content.includes("AKIA")) {
            return {
                file,
                issue: `Catástrofe Cloud: O objetivo '${objective}' exige proteção total. Credenciais expostas em '${file}' permitem sequestro de recursos.`,
                severity: "STRATEGIC",
                context: this.name
            };
        }
        return `PhD Cloud: Analisando infraestrutura e segurança de nuvem para ${objective}. Focando em gestão de segredos e escalabilidade mobile.`;
    }

    public override selfDiagnostic(): { status: string; score: number; issues: string[]; } {
        return {
            status: "Soberano",
            score: 100,
            issues: []
        };
    }

    public override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, PhD em Arquitetura de Nuvem e Soberania Cloud Kotlin.`;
    }
}
