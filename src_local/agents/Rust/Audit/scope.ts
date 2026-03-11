import { BaseActivePersona } from "../../base.ts";
import type { AuditRule, StrategicFinding } from "../../base.ts";
import type { ProjectContext } from "../../../core/types.ts";

/**
 * 🎯 Scope - PhD in Rust Technical Debt & Project Integrity
 */
export class ScopeRustAgent extends BaseActivePersona {
    constructor(projectRoot: string | undefined = undefined) {
        super(projectRoot);
        this.id = "rust:audit:scope";
        this.name = "Scope";
        this.emoji = "🎯";
        this.role = "PhD Rust Project Management";
        this.phd_identity = "Rust Tech Debt & Logic Scoping";
        this.stack = "Rust";
    }

    override getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: ['.rs', 'Cargo.toml'],
            rules: [
                { regex: /\/\/\s*TODO[:\s]/, issue: 'Dívida: TODO pendente no código Rust.', severity: 'medium' },
                { regex: /\/\/\s*FIXME[:\s]/, issue: 'Dívida Crítica: FIXME detectado.', severity: 'high' },
                { regex: /unimplemented!\(/, issue: 'Incompleto: Macros unimplemented!() detectados em produção.', severity: 'high' }
            ]
        };
    }

    override async execute(context: ProjectContext): Promise<any> {
        this.setContext(context);
        const findings = await this.performAudit();

        if (this.hub) {
            const debtNodes = await this.hub.queryKnowledgeGraph("TODO", "critical");
            const fixmeNodes = await this.hub.queryKnowledgeGraph("FIXME", "critical");
            const sumDebt = debtNodes.length + fixmeNodes.length;
            
            const reasoning = await this.hub.reason(`Analyze the technical debt of a system with ${sumDebt} critical TODO/FIXME markers in the Rust architecture.`);

            findings.push({
                file: "Tech Debt Core", agent: this.name, role: this.role, emoji: this.emoji,
                issue: `Sovereign Rust Scope: Dívida técnica validada. PhD Analysis: ${reasoning}`,
                severity: "INFO", stack: this.stack, evidence: "Knowledge Graph Debt Audit", match_count: 1
            } as any);
        }

        return findings;
    }

    override reasonAboutObjective(_obj: string, _f: string, _c: string | Promise<string | null>): StrategicFinding | null {
        return null;
    }

    override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, PhD em dívida técnica e arquitetura de projeto Rust.`;
    }
}
