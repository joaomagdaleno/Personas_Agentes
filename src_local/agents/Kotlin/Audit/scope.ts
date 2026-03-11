/**
 * 🔭 Scope - PhD in Product Strategy (Kotlin)
 * Especialista em gestão de débitos técnicos Android e alinhamento de roadmap técnico Kotlin.
 */
import type { AuditRule, StrategicFinding } from "../../base.ts";
import { BaseActivePersona } from "../../base.ts";

export class ScopePersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Scope";
        this.emoji = "🔭";
        this.role = "PhD Product Engineer";
        this.phd_identity = "Product Strategy & Technical Debt (Kotlin)";
        this.stack = "Kotlin";
    }

    public override async execute(context: any): Promise<any> {
        this.setContext(context);
        const findings = await this.performAudit();

        if (this.hub) {
            // Scope Intelligence: Query Tech Debt
            const debtNodes = await this.hub.queryKnowledgeGraph("TODO", "critical");
            const fixmeNodes = await this.hub.queryKnowledgeGraph("FIXME", "critical");
            const sumDebt = debtNodes.length + fixmeNodes.length;
            
            // PhD Scope Reasoning
            const reasoning = await this.hub.reason(`Analyze the technical debt of a system with ${sumDebt} critical TODO/FIXME markers in the Kotlin architecture.`);

            findings.push({
                file: "Tech Debt Core", agent: this.name, role: this.role, emoji: this.emoji,
                issue: `Sovereign Kotlin Scope: Dívida técnica validada via Rust Hub. PhD Analysis: ${reasoning}`,
                severity: "INFO", stack: this.stack, evidence: "Knowledge Graph Debt Audit", match_count: 1
            } as any);
        }
        return findings;
    }

    getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: [".kt"],
            rules: [
                { regex: /\/\/\s*TODO[:\s]/, issue: "Dívida: TODO pendente no código Kotlin.", severity: "medium" },
                { regex: /\/\/\s*FIXME[:\s]/, issue: "Dívida Crítica: FIXME detectado na lógica Kotlin.", severity: "high" },
                { regex: /\/\/\s*HACK[:\s]/, issue: "Gambiarra: HACK detectado no projeto Kotlin.", severity: "high" },
                { regex: /\/\/\s*XXX[:\s]/, issue: "Alerta: Verifique ponto crítico XXX no código Kotlin.", severity: "medium" },
                { regex: /TODO\(|throw\s+NotImplementedError/, issue: "Incompleto: Funcionalidade Kotlin declarada com placeholder.", severity: "high" },
                { regex: /@Suppress/, issue: "Omissão: Supressão manual de avisos; verifique dívida técnica Kotlin.", severity: "low" }
            ]
        };
    }

    public override reasonAboutObjective(objective: string, _file: string, _content: string): StrategicFinding | null {
        return {
            objective,
            analysis: "Auditando integridade do backlog e dívida técnica Kotlin.",
            recommendation: "Garantir que todos os marcadores de dívida técnica sejam resolvidos antes do fechamento do sprint.",
            severity: "INFO",
            file: _file,
            issue: "PhD Scope: Analisando integridade do backlog e eliminação de dívida técnica Kotlin.",
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
        return `Você é o Dr. ${this.name}, PhD em Estratégia de Produto e Engenharia Kotlin.`;
    }
}

