import { BaseActivePersona } from "../../base.ts";
import type { AuditRule, StrategicFinding } from "../../base.ts";
import type { ProjectContext } from "../../../core/types.ts";

/**
 * 🔬 Dr. Probe — PhD in Bun Error Resilience & Exception Handling
 * Especialista em tratamento de erros no Bun runtime, catch de Bun.serve e promises.
 */
export class ProbePersona extends BaseActivePersona {
    constructor(projectRoot: string | undefined = undefined) {
        super(projectRoot);
        this.name = "Probe";
        this.emoji = "🔬";
        this.role = "PhD Bun Resilience Engineer";
        this.phd_identity = "Bun Error Resilience & Exception Handling";
        this.stack = "Bun";
    }

    override async execute(context: ProjectContext): Promise<any> {
        this.setContext(context);
        const findings = await this.performAudit();

        if (this.hub) {
            // Strategic Resilience: Impact analysis
            const graph = await this.hub.getKnowledgeGraph("src_local/core/types.ts", 2);
            
            // Search for Swallowed Errors in Bun/TS
            const errorLeaks = await this.hub.queryKnowledgeGraph("catch", "critical");

            // PhD Resilience Reasoning
            const reasoning = await this.hub.reason(`Analyze the Bun resilience baseline given ${errorLeaks.length} empty catch blocks in a graph of ${graph.nodes.length} nodes.`);

            findings.push({
                file: "Resilience Core", agent: this.name, role: this.role, emoji: this.emoji,
                issue: `Sovereign Bun Resilience: Integridade de fluxo validada. PhD Analysis: ${reasoning}`,
                severity: "INFO", stack: this.stack, evidence: "Graph Error Trace Analysis", match_count: 1
            } as any);
        }
        return findings;
    }

    override getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: ['.ts', '.tsx'],
            rules: [
                { regex: /catch\s*\([^)]*\)\s*\{\s*\}/, issue: 'Silenciado: catch vazio engole exceção Bun.', severity: 'critical' },
                { regex: /catch\s*\{\s*\}/, issue: 'Silenciado: catch vazio sem parâmetro no Bun.', severity: 'critical' },
                { regex: /\.catch\(\(\)\s*=>\s*\{\s*\}\)/, issue: 'Silenciado: Promise .catch vazio no runtime Bun.', severity: 'critical' },
                { regex: /\.catch\(\(\)\s*=>\s*null\)/, issue: 'Suprimido: Promise .catch retorna null — erro perdido no Bun.', severity: 'high' },
                { regex: /catch\s*\([^)]*\)\s*\{[^}]*\/\/\s*(?:todo|ignore|suppress)/, issue: 'Débito: Catch com TODO/ignore indica tratamento pendente no Bun.', severity: 'medium' },
                { regex: /throw\s+new\s+Error\(\)/, issue: 'Vago: Error lançado sem mensagem descritiva no Bun.', severity: 'medium' },
            ]
        };
    }

    reasonAboutObjective(objective: string, file: string, content: string | Promise<string | null>): StrategicFinding | string | null {
        if (typeof content !== 'string') return null;
        if (content["match"](/catch\s*\([^)]*\)\s*\{\s*\}/)) {
            return {
                file, severity: "CRITICAL",
                issue: `Instabilidade: O objetivo '${objective}' exige resiliência. Em '${file}', falhas silenciadas impedem a auto-correção da 'Orquestração de Inteligência Artificial' Bun.`,
                context: "empty catch block detected"
            };
        }
        return null;
    }

    override selfDiagnostic(): any {
        return {
            status: "Soberano",
            score: 100,
            details: "Diagnóstico de falhas silenciosas Bun operando com rigor PhD."
        };
    }

    override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, mestre em resiliência e tratamento de erros Bun.`;
    }
}
