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

    public override async performAudit(): Promise<AuditFinding[]> {
        this.startMetrics();
        const rules: AuditRule[] = [
            { regex: /\/\/\s*TODO[:\s]/, issue: "Dívida: TODO pendente no código Flutter.", severity: "medium" },
            { regex: /\/\/\s*FIXME[:\s]/, issue: "Dívida Crítica: FIXME detectado na lógica Flutter.", severity: "high" },
            { regex: /\/\/\s*HACK[:\s]/, issue: "Gambiarra: HACK detectado no projeto Flutter.", severity: "high" },
            { regex: /\/\/\s*XXX[:\s]/, issue: "Alerta: Verifique ponto crítico XXX no código Flutter.", severity: "medium" },
            { regex: /throw\s+UnimplementedError\(\)/, issue: "Incompleto: Funcionalidade Flutter declarada mas não implementada.", severity: "high" },
            { regex: /\/\/\s*ignore[:\s]/, issue: "Omissão: Supressão manual de lint; verifique dívida técnica Flutter.", severity: "low" }
        ];
        const results = await this.findPatterns([".dart"], rules);
        this.endMetrics(results.length);
        return results;
    }

    public override reasonAboutObjective(objective: string, _file: string, _content: string): StrategicFinding | null {
        return {
            objective,
            analysis: "Auditando integridade do backlog e dívida técnica Flutter.",
            recommendation: "Garantir que todos os marcadores de dívida técnica sejam resolvidos para manter a soberania do app.",
            severity: "INFO",
            file: _file,
            issue: "PhD Scope: Analisando integridade do backlog e eliminação de dívida técnica.",
            context: this.name
        } as StrategicFinding;
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

