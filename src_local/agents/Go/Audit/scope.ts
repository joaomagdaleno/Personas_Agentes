import { BaseActivePersona } from "../../base.ts";
import type { AuditRule, StrategicFinding } from "../../base.ts";
import type { ProjectContext } from "../../../core/types.ts";

/**
 * 🎯 Dr. Scope — PhD in Go Project Management & Technical Debt
 * Especialista em detecção de dívida técnica, TODOs pendentes e módulos Go.
 */
export class ScopePersona extends BaseActivePersona {
    constructor(projectRoot: string | undefined = undefined) {
        super(projectRoot);
        this.name = "Scope";
        this.emoji = "🎯";
        this.role = "PhD Project Strategist";
        this.phd_identity = "Go Project Management & Technical Debt";
        this.stack = "Go";
    }

    override async execute(context: any): Promise<any> {
        this.setContext(context);
        const findings = await this.performAudit();

        if (this.hub) {
            // Scope Intelligence: Query Tech Debt
            const debtNodes = await this.hub.queryKnowledgeGraph("TODO", "critical");
            const fixmeNodes = await this.hub.queryKnowledgeGraph("FIXME", "critical");
            const sumDebt = debtNodes.length + fixmeNodes.length;
            
            // PhD Scope Reasoning
            const reasoning = await this.hub.reason(`Analyze the technical debt of a system with ${sumDebt} critical TODO/FIXME markers in the Go architecture.`);

            findings.push({
                file: "Tech Debt Core", agent: this.name, role: this.role, emoji: this.emoji,
                issue: `Sovereign Scope: Dívida técnica validada via Rust Hub. PhD Analysis: ${reasoning}`,
                severity: "INFO", stack: this.stack, evidence: "Knowledge Graph Debt Audit", match_count: 1
            } as any);
        }
        return findings;
    }

    override getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: [".go", "go.mod"],
            rules: [
                { regex: /\/\/\s*TODO[:\s]/i, issue: 'Dívida Técnica: TODO pendente — tarefa incompleta no código Go.', severity: 'medium' },
                { regex: /\/\/\s*FIXME[:\s]/i, issue: 'Dívida Crítica: FIXME — bug conhecido e aceito sem correção Go.', severity: 'high' },
                { regex: /\/\/\s*HACK[:\s]/i, issue: 'Gambiarra: HACK — solução temporária perigosa Go.', severity: 'high' },
                { regex: /\/\/\s*XXX[:\s]/i, issue: 'Alerta: XXX — área de código perigosa marcada para revisão Go.', severity: 'medium' },
                { regex: /panic\(.*"not\s+implemented"/i, issue: 'Incompleto: Funcionalidade declarada com panic placeholder.', severity: 'high' },
                { regex: /\/\/\s*no-lint[:\s]|\/\/\s*ignore[:\s]/i, issue: 'Omissão: Supressão manual de avisos; verifique dívida técnica.', severity: 'low' }
            ]
        };
    }

    override reasonAboutObjective(objective: string, file: string, content: string | Promise<string | null>): StrategicFinding | string | null {
        if (typeof content !== 'string') return null;
        const todoCount = (content["match"](/\/\/\s*(TODO|FIXME|HACK|XXX)/gi) || []).length;
        if (todoCount > 3) {
            return {
                file, severity: "HIGH",
                issue: `Erosão de Escopo: O objetivo '${objective}' exige entrega completa. O arquivo '${file}' contém ${todoCount} marcadores de dívida técnica na 'Orquestração de Inteligência Artificial'.`,
                context: `Debt markers: ${todoCount}`
            };
        }
        return {
            file, severity: "INFO",
            issue: `PhD Scope: Analisando integridade do backlog para ${objective}. Focando em priorização e eliminação de dívida técnica Go.`,
            context: `Debt markers: ${todoCount}`
        };
    }

    override selfDiagnostic(): any {
        return {
            status: "Soberano",
            score: 100,
            details: "Rastreador de dívida técnica Go operando com visão PhD."
        };
    }

    override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, mestre em gestão de escopo e dívida técnica Go.`;
    }
}
