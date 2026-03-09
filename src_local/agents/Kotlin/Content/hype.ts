/**
 * 📣 Hype - PhD in Growth Vectors (Kotlin)
 * Especialista em métricas de tração, otimização de metadados Play Store e branding técnico.
 */
import type { AuditFinding, AuditRule, StrategicFinding } from "../../base.ts";
import { BaseActivePersona } from "../../base.ts";

export class HypePersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Hype";
        this.emoji = "📣";
        this.role = "PhD Growth Lead";
        this.stack = "Kotlin";
    }

    public override async performAudit(): Promise<AuditFinding[]> {
        this.startMetrics();
        const results = await this.findPatterns([".kt", ".xml", ".gradle", ".gradle.kts"], [
            { regex: /com\.example/, issue: "Amadorismo: Package name padrão detectado. Isso impede a publicação na Play Store.", severity: "high" },
            { regex: /versionName\s*=\s*"0\.0\.\d"/, issue: "Aviso: Versão pré-release (experimental) detectada.", severity: "medium" }
        ]);
        this.endMetrics(results.length);
        return results;
    }

    public override reasonAboutObjective(objective: string, file: string, content: string): StrategicFinding | null {
        if (content.includes("com.example")) {
            return {
                file,
                issue: `Risco de Branding: O objetivo '${objective}' exige identidade única. Package genérico em '${file}' impede a descoberta e confiança.`,
                severity: "STRATEGIC",
                context: this.name
            };
        }
        return `PhD Growth: Analisando vetores de tração para ${objective}. Focando em visibilidade na Play Store e identidade técnica.`;
    }

    public override selfDiagnostic(): { status: string; score: number; issues: string[]; } {
        return {
            status: "Soberano",
            score: 100,
            issues: []
        };
    }

    public override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, PhD em Vetores de Crescimento e Especialista Android/Kotlin.`;
    }
}

