import { BaseActivePersona } from "../../base.ts";
import type { AuditRule, StrategicFinding } from "../../base.ts";


/**
 * 🎯 Dr. Scope — PhD in Bun Project Debt & Configuration Management
 * Especialista em dívida técnica, bunfig.toml e gestão de dependências Bun.
 */
export class ScopePersona extends BaseActivePersona {
    constructor(projectRoot: string | null = null) {
        super(projectRoot);
        this.name = "Scope";
        this.emoji = "🎯";
        this.role = "PhD Bun Project Strategist";
        this.phd_identity = "Bun Project Debt & Configuration Management";
        this.stack = "Bun";
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
            const reasoning = await this.hub.reason(`Analyze the technical debt of a system with ${sumDebt} critical TODO/FIXME markers in the Bun architecture.`);

            findings.push({
                file: "Tech Debt Core", agent: this.name, role: this.role, emoji: this.emoji,
                issue: `Sovereign Bun Scope: Dívida técnica validada via Rust Hub. PhD Analysis: ${reasoning}`,
                severity: "INFO", stack: this.stack, evidence: "Knowledge Graph Debt Audit", match_count: 1
            } as any);
        }
        return findings;
    }

    getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: ['.ts', '.tsx', '.toml', '.json'],
            rules: [
                { regex: /\/\/\s*TODO[:\s]/i, issue: 'Dívida: TODO pendente no código Bun.', severity: 'medium' },
                { regex: /\/\/\s*FIXME[:\s]/i, issue: 'Dívida Crítica: FIXME no código Bun.', severity: 'high' },
                { regex: /\/\/\s*HACK[:\s]/i, issue: 'Gambiarra: HACK detectado no projeto Bun.', severity: 'high' },
                { regex: /\/\/\s*XXX[:\s]/i, issue: 'Alerta: Área de código perigosa XXX no projeto Bun.', severity: 'medium' },
                { regex: /throw\s+new\s+Error\(["']not\s+implemented/i, issue: 'Incompleto: Funcionalidade Bun declarada mas não implementada.', severity: 'high' },
                { regex: /as\s+any\s*\/\/.*later|as\s+any\s*\/\/.*temporary/i, issue: 'Supressão Temporária: "any" com promessa de correção futura no Bun.', severity: 'medium' }
            ]
        };
    }

    reasonAboutObjective(objective: string, file: string, content: string | Promise<string | null>): StrategicFinding | string | null {
        if (typeof content !== 'string') return null;
        const debtCount = (content.match(/\/\/\s*(TODO|FIXME|HACK)/gi) || []).length;
        if (debtCount > 3) {
            return {
                file, severity: "HIGH",
                issue: `Erosão de Escopo: O objetivo '${objective}' exige completude. O arquivo '${file}' contém ${debtCount} marcadores de dívida técnica Bun.`,
                context: `Debt markers: ${debtCount}`
            };
        }
        return null;
    }

    getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, mestre em gestão de escopo e dívida técnica Bun.`;
    }
}
