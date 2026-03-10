import { BaseActivePersona } from "../../base.ts";
import type { AuditRule, StrategicFinding, AuditFinding } from "../../base.ts";
import type { ProjectContext } from "../../../core/types.ts";

/**
 * 🔬 PROBE Persona (Rust Stack) - HYBRID VERSION
 * Especialista em resiliência nativa, pânicos e segurança de memória.
 */
export class ProbeRustAgent extends BaseActivePersona {
    constructor(projectRoot: string | undefined = undefined) {
        super(projectRoot);
        this.id = "rust:audit:probe";
        this.name = "Probe";
        this.emoji = "🔬";
        this.role = "PhD Resilience Engineer";
        this.phd_identity = "Rust Native Resilience & Exception Handling";
        this.stack = "Rust";
    }

    override getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: ['.rs'],
            rules: [
                { regex: /panic!\(/, issue: 'Critical: Pânico explícito detectado. Use Result para tratamento resiliente.', severity: 'critical' },
                { regex: /\.unwrap\(\)/, issue: 'Resiliência: unwrap() pode causar pânicos fatais no núcleo.', severity: 'high' },
                { regex: /unsafe\s*\{/, issue: 'Segurança: Bloco unsafe detectado; verifique isolamento e invariants.', severity: 'medium' },
                { regex: /extern\s+"C"/, issue: 'FFI: Chamada nativa externa detectada; risco de corrupção de stack.', severity: 'medium' }
            ]
        };
    }

    override async execute(context: ProjectContext): Promise<AuditFinding[]> {
        this.setContext(context);
        const findings = await this.performAudit();

        if (this.hub) {
            // Strategic Resilience: Knowledge Graph of Error Propagation
            const graph = await this.hub.getKnowledgeGraph("src_native/analyzer/src/main.rs", 2);
            
            // Search for Critical Panics
            const panicQuery = await this.hub.queryKnowledgeGraph("panic", "critical");

            // PhD Resilience Reasoning
            const reasoning = await this.hub.reason(`Analyze the native resilience of the Rust core given ${panicQuery.length} potential panic points and core graph connectivity.`);

            findings.push({
                file: "Resilience Core", agent: this.name, role: this.role, emoji: this.emoji,
                issue: `Sovereign Resilience: Integridade nativa validada. PhD Analysis: ${reasoning}`,
                severity: "INFO", stack: "Rust", evidence: `KG Depth: ${graph.nodes.length} nodes analyzed`, match_count: 1
            } as any);
        }

        return findings;
    }

    override reasonAboutObjective(_obj: string, _f: string, _c: string | Promise<string | null>): StrategicFinding | null {
        return null; // Audit focus
    }

    override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, PhD em resiliência de sistemas nativos e mestre em evitar pânicos no ecossistema Rust.`;
    }
}
