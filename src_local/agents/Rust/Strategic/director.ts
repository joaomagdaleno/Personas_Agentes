import { BaseActivePersona } from "../../base.ts";
import type { AuditRule, StrategicFinding } from "../../base.ts";
import type { ProjectContext } from "../../../core/types.ts";

/**
 * 🏛️ Director - Executive PhD in Rust Orchestration
 */
export class DirectorRustAgent extends BaseActivePersona {
    constructor(projectRoot: string | undefined = undefined) {
        super(projectRoot);
        this.id = "rust:strategic:director";
        this.name = "Director";
        this.emoji = "🏛️";
        this.role = "PhD Rust Orchestrator";
        this.phd_identity = "Sovereign Rust Systemic Orchestration";
        this.stack = "Rust";
    }

    override getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: ['.rs'],
            rules: [
                { regex: /pub\s+fn\s+main/, issue: 'Orquestração: Entry point do Rust.', severity: 'low' }
            ]
        };
    }

    override async execute(context: ProjectContext): Promise<any> {
        this.setContext(context);
        const findings = await this.performAudit();

        if (this.hub) {
            const orchestratorNodes = await this.hub.queryKnowledgeGraph("orchestrator", "high");
            
            const reasoning = await this.hub.reason(`Synthesize an executive summary of the system's architecture and orchestration balance, given ${orchestratorNodes.length} orchestrator control nodes in ${this.stack}.`);

            findings.push({
                file: "Executive Summary", agent: this.name, role: this.role, emoji: this.emoji,
                issue: `Sovereign Direction: Alinhamento estratégico validado via Rust Hub. PhD Analysis: ${reasoning}`,
                severity: "STRATEGIC", stack: this.stack, evidence: "Knowledge Graph Orchestration Analysis", match_count: 1
            } as any);
        }

        return findings;
    }

    override reasonAboutObjective(_obj: string, _f: string, _c: string | Promise<string | null>): StrategicFinding | null {
        return null;
    }

    override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, mestre da orquestração nativa em Rust e coordenador PhD do Brain.`;
    }
}
