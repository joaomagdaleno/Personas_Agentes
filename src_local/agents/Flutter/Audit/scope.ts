/**
 * 🔭 Scope - PhD in Product Strategy & Technical Scope (Flutter)
 * Especialista em gestão de débitos técnicos, marcadores de incompletude e alinhamento de visão.
 */
import type { AuditFinding, AuditRule, StrategicFinding } from "../../base.ts";
import { BaseActivePersona } from "../../base.ts";

export class ScopePersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Scope";
        this.emoji = "🔭";
        this.role = "PhD Product Engineer";
        this.stack = "Flutter";
    }

    public override performAudit(): AuditFinding[] {
        this.startMetrics();
        const rules: AuditRule[] = [
            { regex: /\/\/\s*TODO/, issue: "Débito Técnico: Marcador TODO detectado. Verifique pendências de entrega.", severity: "low" },
            { regex: /throw\s+UnimplementedError\(\)/, issue: "Incompletude: Funcionalidade prometida mas não implementada.", severity: "high" }
        ];
        const results = this.findPatterns([".dart"], rules);
        this.endMetrics(results.length);
        return results;
    }

    public override reasonAboutObjective(objective: string, _file: string, _content: string): string | StrategicFinding | null {
        return `PhD Product: Analisando escopo técnico e débitos para ${objective}. Garantindo que o MVP não comprometa a estabilidade.`;
    }

    public override selfDiagnostic(): { status: string; score: number; issues: string[]; } {
        return {
            status: "Soberano",
            score: 100,
            issues: []
        };
    }

    public override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, PhD em Estratégia de Produto e Escopo Técnico Flutter.`;
    }
}
