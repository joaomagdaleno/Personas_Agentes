/**
 * 🧘 Mantra - PhD in Quality Architecture (Kotlin)
 * Especialista em pureza de código, gestão de estado imutável e integridade estrutural Android.
 */
import type { AuditFinding, AuditRule, StrategicFinding } from "../../base.ts";
import { BaseActivePersona } from "../../base.ts";

export class MantraPersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Mantra";
        this.emoji = "🧘";
        this.role = "PhD Quality Architect";
        this.stack = "Kotlin";
    }

    public override performAudit(): AuditFinding[] {
        this.startMetrics();
        const results = this.findPatterns([".kt"], [
            { regex: /var\s+\w+:\s*\w+\?\s*=\s*null/, issue: "Entropia: Uso de estado mutável nullable detectado. Prefira imutabilidade (val).", severity: "medium" },
            { regex: /catch\s*\(\w+:\s*Exception\)\s*\{\s*\}/, issue: "Anti-padrão: Exceção capturada e ignorada. Isso silencia falhas de integridade.", severity: "critical" }
        ]);
        this.endMetrics(results.length);
        return results;
    }

    public override reasonAboutObjective(objective: string, file: string, content: string): StrategicFinding | null {
        if (content.includes("var") && content.includes("null")) {
            return {
                file,
                issue: "Entropia Lógica: Estado mutável nullable detectado. Isso viola o Mantra de Pureza e dificulta a manutenção.",
                severity: "STRATEGIC",
                context: this.name
            };
        }
        return `PhD Purity: Analisando integridade estrutural para ${objective}. Focando em imutabilidade e tratamento robusto de falhas.`;
    }

    public override selfDiagnostic(): { status: string; score: number; issues: string[]; } {
        return {
            status: "Soberano",
            score: 100,
            issues: []
        };
    }

    public override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, PhD em Arquitetura de Qualidade e Pureza Kotlin.`;
    }
}
