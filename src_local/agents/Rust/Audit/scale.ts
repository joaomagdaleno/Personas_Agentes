import { BaseActivePersona } from "../../base.ts";
import type { AuditRule, StrategicFinding, AuditFinding } from "../../base.ts";
import type { ProjectContext } from "../../../core/types.ts";

/**
 * 🏗️ Scale Persona (Rust Stack) - HYBRID VERSION
 * Especialista em arquitetura de sistemas nativos e escalabilidade de memória/CPU.
 */
export class ScaleRustAgent extends BaseActivePersona {
    constructor(projectRoot: string | undefined = undefined) {
        super(projectRoot);
        this.id = "rust:audit:scale";
        this.name = "Scale";
        this.emoji = "🏗️";
        this.role = "PhD Software Architect";
        this.phd_identity = "Rust Native Architecture & Scalability";
        this.stack = "Rust";
    }

    override getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: ['.rs', 'Cargo.toml'],
            rules: [
                { regex: /std::sync::Arc/, issue: 'Escalabilidade: Uso intensivo de Arc detectado; verifique se há contenção de lock.', severity: 'low' },
                { regex: /std::sync::Mutex/, issue: 'Performance: Mutex detectado; considere RwLock para leitura massiva.', severity: 'medium' },
                { regex: /\n{500,}/, issue: 'God File: Arquivo Rust com mais de 500 linhas; risco de entropia.', severity: 'high' }
            ]
        };
    }

    override async execute(context: ProjectContext): Promise<AuditFinding[]> {
        this.setContext(context);
        const findings = await this.performAudit();

        if (this.hub) {
            // Architectural Intelligence via Knowledge Graph
            const graph = await this.hub.getKnowledgeGraph("src/main.rs", 2);

            // PhD Architectural Reasoning
            const reasoning = await this.hub.reason(`Analyze the architectural scalability of the Rust core given a graph of ${graph.nodes.length} nodes and identify critical bottlenecks.`);

            findings.push({
                file: "Architecture Core", agent: this.name, role: this.role, emoji: this.emoji,
                issue: `Sovereign Scale: Escalabilidade nativa auditada. PhD Analysis: ${reasoning}`,
                severity: "INFO", stack: "Rust", evidence: `Native Architecture Audit (KG Depth: ${graph.nodes.length})`, match_count: 1
            } as any);
        }

        return findings;
    }

    override reasonAboutObjective(_obj: string, _f: string, _c: string | Promise<string | null>): StrategicFinding | null {
        return null; // Audit focus
    }

    override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, PhD em arquitetura de sistemas de alta performance e mestre em escalabilidade Rust.`;
    }
}
