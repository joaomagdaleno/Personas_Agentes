/**
 * 📣 Hype - PhD in Growth Vectors & Agent Discovery (Flutter)
 * Especialista em vetores de crescimento, descoberta de agentes e otimização de metadados.
 */
import type { AuditFinding, AuditRule, StrategicFinding } from "../../base.ts";
import { BaseActivePersona } from "../../base.ts";

export class HypePersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Hype";
        this.emoji = "📣";
        this.role = "PhD Growth Lead";
        this.stack = "Flutter";
    }

    public override async performAudit(): Promise<AuditFinding[]> {
        this.startMetrics();
        const results = await this.findPatterns([".dart", ".xml", ".yaml"], [
            { regex: /com\.example/, issue: "Amadorismo: Package name padrão detectado. Altere para o seu domínio real.", severity: "high" },
            { regex: /displayName:\s*['"]/, issue: "Invisibilidade: Nome de exibição não parametrizado.", severity: "low" }
        ]);
        this.endMetrics(results.length);
        return results;
    }

    public override reasonAboutObjective(objective: string, file: string, content: string): StrategicFinding | null {
        if (content.includes("com.example")) {
            return {
                file,
                issue: `Risco de Tração: O objetivo '${objective}' exige identidade única. Em '${file}', identificadores genéricos impedem a descoberta e confiança.`,
                severity: "STRATEGIC",
                context: this.name
            };
        }
        return `PhD Growth: Analisando visibilidade e tração para ${objective}. Focando em otimização de metadados e branding técnico.`;
    }

    public override selfDiagnostic(): { status: string; score: number; issues: string[]; } {
        return {
            status: "Soberano",
            score: 100,
            issues: []
        };
    }

    public override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, PhD em Vetores de Crescimento e Descoberta de Agentes Flutter.`;
    }
}

