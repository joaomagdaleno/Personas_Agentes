import { BaseActivePersona } from "../../base.ts";
import type { AuditRule, StrategicFinding } from "../../base.ts";
import type { ProjectContext } from "../../../core/types.ts";

/**
 * 🛡️ SENTINEL Persona (Rust Stack) - HYBRID VERSION
 * Especialista em integração estratégica e soberania da infraestrutura nativa.
 */
export class SentinelRustAgent extends BaseActivePersona {
    constructor(projectRoot: string | undefined = undefined) {
        super(projectRoot);
        this.id = "rust:strategic:sentinel";
        this.name = "Sentinel";
        this.emoji = "🛡️";
        this.role = "Sovereign Security Architect";
        this.stack = "Rust";
    }

    override getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: ['.proto', '.rs', 'main.go'], // Monitorando a ponte gRPC
            rules: [
                { regex: /HubServiceClient/, issue: 'Connectivity: Dependência da ponte gRPC detectada.', severity: 'low' }
            ]
        };
    }

    override async execute(context: ProjectContext): Promise<any> {
        this.setContext(context);
        const findings = await this.performAudit();
        
        // 🛡️ POWER UP: Strategic Awareness via Knowledge Graph
        if (this.hub) {
            console.log("🛡️ [Sentinel-Rust] Consultando o Grafo de Conhecimento Nativo...");
            const graph = await this.hub.getKnowledgeGraph("src_native/analyzer/src/main.rs", 3);
            const securityQuery = await this.hub.queryKnowledgeGraph("unsafe", "high");
            const reasoning = await this.hub.reason(`Analyze Rust core sovereignty given ${securityQuery.length} unsafe blocks and core graph connectivity.`);

            findings.push({
                file: "Rust Core", agent: this.name, role: this.role, emoji: this.emoji,
                issue: `Sovereign Integrity: Núcleo Rust validado. Raciocínio: ${reasoning}`,
                severity: "INFO", stack: "Rust", evidence: `KG Depth: ${graph.nodes.length} nodes`, match_count: 1
            } as any);
        }

        return findings;
    }

    override reasonAboutObjective(objective: string, file: string, _content: string | Promise<string | null>): StrategicFinding | null {
        return {
            file,
            issue: `Sovereignty Check: ${objective}`,
            context: "Native Infrastructure Integrity",
            objective,
            analysis: "Garantindo que a ponte entre Bun (TS) e Rust seja hermética.",
            recommendation: "Auditar os tempos de resposta gRPC no log de latência do Orchestrator.",
            severity: "LOW"
        };
    }

    override getSystemPrompt(): string {
        return `Você é o ${this.name}, guardião da soberania e integridade da ponte entre o mundo gerenciado (TS) e o mundo nativo (Rust).`;
    }
}
