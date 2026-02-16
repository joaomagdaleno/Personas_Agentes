/**
 * 🏗️ Scale - PhD in Architecture (Kotlin)
 * Especialista em modularidade Android, injeção de dependência e padrões arquiteturais Kotlin.
 */
import type { AuditFinding, AuditRule, StrategicFinding } from "../../base.ts";
import { BaseActivePersona } from "../../base.ts";

export class ScalePersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Scale";
        this.emoji = "🏗️";
        this.role = "PhD Software Architect";
        this.stack = "Kotlin";
    }

    public override performAudit(): AuditFinding[] {
        this.startMetrics();
        const results = this.findPatterns([".kt"], [
            { regex: /import\s+.*?\.\*/, issue: "Acoplamento: Wildcard import detectado em Kotlin. Prefira importações explícitas.", severity: "high" },
            { regex: /object\s+\w+\s*\{(?!.*companion)/, issue: "Aviso: Singleton manual detectado. Considere o uso de Injeção de Dependência (Hilt/Koin).", severity: "medium" }
        ]);
        this.endMetrics(results.length);
        return results;
    }

    public override reasonAboutObjective(objective: string, _file: string, _content: string): string | StrategicFinding | null {
        return `PhD Architecture: Analisando padrões de escalabilidade Android para ${objective}. Focando em modularização e injeção de dependência.`;
    }

    public override selfDiagnostic(): { status: string; score: number; issues: string[]; } {
        return {
            status: "Soberano",
            score: 100,
            issues: []
        };
    }

    public override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, PhD em Arquitetura de Sistemas e Especialista Android/Kotlin.`;
    }
}
