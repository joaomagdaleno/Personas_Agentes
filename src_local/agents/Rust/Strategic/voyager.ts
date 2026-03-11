import { BaseActivePersona } from "../../base.ts";
import type { AuditRule, StrategicFinding, AuditFinding } from "../../base.ts";
import type { ProjectContext } from "../../../core/types.ts";

/**
 * 🧭 Voyager Persona (Rust Stack) - HYBRID VERSION
 * Especialista em modernização de código Rust e adoção de padrões idiomáticos (ES2024+ patterns applied to Rust logic).
 */
export class VoyagerRustAgent extends BaseActivePersona {
    constructor(projectRoot: string | undefined = undefined) {
        super(projectRoot);
        this.id = "rust:strategic:voyager";
        this.name = "Voyager";
        this.emoji = "🧭";
        this.role = "PhD Innovation Engineer";
        this.phd_identity = "Rust Modernization & Idiomatic Patterns";
        this.stack = "Rust";
    }

    override getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: ['.rs'],
            rules: [
                { regex: /extern\s+crate/, issue: 'Legado: "extern crate" detectado; use caminhos do Rust 2018+.', severity: 'medium' },
                { regex: /unsafe\s*\{/, issue: 'Observação: Bloco unsafe detectado; verifique se há alternativa segura moderna.', severity: 'low' },
                { regex: /let\s+mut\s+\w+\s*=\s*(String|Vec)::new\(\);/, issue: 'Sugestão: Verifique se o pré-allocation com with_capacity() é preferível para inovação em performance.', severity: 'low' }
            ]
        };
    }

    override async execute(context: ProjectContext): Promise<AuditFinding[]> {
        this.setContext(context);
        const findings = await this.performAudit();

        if (this.hub) {
            // Modernity Intelligence via Knowledge Graph
            const legacyQuery = await this.hub.queryKnowledgeGraph("legacy", "medium");

            // PhD Modernization Reasoning
            const reasoning = await this.hub.reason(`Generate a PhD modernization roadmap for the Rust core given ${legacyQuery.length} legacy patterns found in the graph.`);

            findings.push({
                file: "Innovation Core", agent: this.name, role: this.role, emoji: this.emoji,
                issue: `Sovereign Voyager: Modernidade nativa auditada. PhD Analysis: ${reasoning}`,
                severity: "INFO", stack: "Rust", evidence: "Native Modernity Audit", match_count: 1
            } as any);
        }

        return findings;
    }

    override reasonAboutObjective(_obj: string, _f: string, _c: string | Promise<string | null>): StrategicFinding | null {
        return null; // Audit focus
    }

    override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, PhD em modernização de sistemas nativos e mestre em transformar código legado Rust em arte idiomática.`;
    }
}
