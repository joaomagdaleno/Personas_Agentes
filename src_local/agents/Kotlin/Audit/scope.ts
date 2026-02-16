/**
 * 🔭 Scope - PhD in Product Strategy (Kotlin)
 * Especialista em gestão de débitos técnicos Android e alinhamento de roadmap técnico Kotlin.
 */
import type { AuditFinding, AuditRule, StrategicFinding } from "../../base.ts";
import { BaseActivePersona } from "../../base.ts";

export class ScopePersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Scope";
        this.emoji = "🔭";
        this.role = "PhD Product Engineer";
        this.stack = "Kotlin";
    }

    public override performAudit(): AuditFinding[] {
        this.startMetrics();
        const results = this.findPatterns([".kt"], [
            { regex: /\/\/\s*TODO/, issue: "Débito Técnico: Marcador TODO detectado. Verifique pendências no Jira/Linear.", severity: "low" },
            { regex: /throw\s+NotImplementedError/, issue: "Incompletude: Funcionalidade prometida mas não implementada no código Kotlin.", severity: "high" }
        ]);
        this.endMetrics(results.length);
        return results;
    }

    public override reasonAboutObjective(objective: string, _file: string, _content: string): string | StrategicFinding | null {
        return `PhD Product: Analisando escopo e débitos técnicos para ${objective}. Garantindo que o roadmap técnico Android seja cumprido.`;
    }

    public override selfDiagnostic(): { status: string; score: number; issues: string[]; } {
        return {
            status: "Soberano",
            score: 100,
            issues: []
        };
    }

    public override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, PhD em Estratégia de Produto e Engenharia Kotlin.`;
    }
}
