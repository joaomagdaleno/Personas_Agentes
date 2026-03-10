import { BaseActivePersona } from "../../base.ts";
import type { AuditRule, StrategicFinding, AuditFinding } from "../../base.ts";
import type { ProjectContext } from "../../../core/types.ts";

/**
 * 🧪 TESTIFY Persona (Rust Stack) - HYBRID VERSION
 * Especialista em qualidade de código nativo e cobertura de testes Rust.
 */
export class TestifyRustAgent extends BaseActivePersona {
    constructor(projectRoot: string | undefined = undefined) {
        super(projectRoot);
        this.id = "rust:audit:testify";
        this.name = "Testify";
        this.emoji = "🧪";
        this.role = "PhD Quality Assurance Engineer";
        this.phd_identity = "Rust Native Quality & QA";
        this.stack = "Rust";
    }

    override getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: ['.rs', 'Cargo.toml'],
            rules: [
                { regex: /#\[test\]/, issue: 'Informação: Teste unitário detectado.', severity: 'low' },
                { regex: /#\[ignore\]/, issue: 'Qualidade: Teste ignorado detectado; cobertura reduzida.', severity: 'high' },
                { regex: /assert!\(true\)/, issue: 'Qualidade: Asserção fraca detectada.', severity: 'high' },
                { regex: /#\[cfg\(test\)\]\s*mod\s+tests\s*\{\s*\}/, issue: 'Matéria Escura: Módulo de teste vazio detectado.', severity: 'critical' }
            ]
        };
    }

    override async execute(context: ProjectContext): Promise<AuditFinding[]> {
        this.setContext(context);
        const findings = await this.performAudit();

        if (this.hub) {
            // Quality Intelligence via Knowledge Graph
            const graph = await this.hub.getKnowledgeGraph("Cargo.toml", 1);
            
            // Search for Untested native modules
            const untestedQuery = await this.hub.queryKnowledgeGraph("untested", "high");

            // PhD Quality Reasoning
            const reasoning = await this.hub.reason(`Analyze the "Zero Gap" quality of the Rust core given ${untestedQuery.length} untested native modules and Cargo dependency graph.`);

            findings.push({
                file: "Quality Core", agent: this.name, role: this.role, emoji: this.emoji,
                issue: `Sovereign Quality: Cobertura nativa auditada. PhD Analysis: ${reasoning}`,
                severity: "INFO", stack: "Rust", evidence: `Native Quality Audit (KG Depth: ${graph.nodes.length})`, match_count: 1
            } as any);
        }

        return findings;
    }

    override reasonAboutObjective(_obj: string, _f: string, _c: string | Promise<string | null>): StrategicFinding | null {
        return null; // Audit focus
    }

    override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, PhD em garantia de qualidade nativa e mestre em testes de alta performance para Rust.`;
    }
}
