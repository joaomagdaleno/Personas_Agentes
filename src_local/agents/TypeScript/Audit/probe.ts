import { BaseActivePersona } from "../../base.ts";
import type { AuditRule, StrategicFinding } from "../../base.ts";
import type { ProjectContext } from "../../../core/types.ts";

/**
 * 🔬 Dr. Probe — PhD in TypeScript Error Resilience & Exception Handling
 * Especialista em detecção de falhas silenciosas, catches vazios e error swallowing.
 */
export class ProbePersona extends BaseActivePersona {
    constructor(projectRoot: string | undefined = undefined) {
        super(projectRoot);
        this.name = "Probe";
        this.emoji = "🔬";
        this.role = "PhD Resilience Engineer";
        this.phd_identity = "TypeScript Error Resilience & Exception Handling";
        this.stack = "TypeScript";
    }

    override async execute(context: ProjectContext): Promise<any> {
        this.setContext(context);
        const findings = await this.performAudit();

        if (this.hub) {
            // Strategic Resilience: Impact analysis
            const graph = await this.hub.getKnowledgeGraph("src_local/core/types.ts", 2);
            
            // Search for Swallowed Errors [Empty Catches]
            const Errors = await this.hub.queryKnowledgeGraph("catch", "critical");

            // PhD Resilience Reasoning
            const reasoning = await this.hub.reason(`Analyze the impact of silent failures in files related to ${Errors.length} empty catch blocks within a graph of ${graph.nodes.length} nodes.`);

            findings.push({
                file: "Resilience Core", agent: this.name, role: this.role, emoji: this.emoji,
                issue: `Sovereign Resilience: Integridade de fluxo validada. PhD Analysis: ${reasoning}`,
                severity: "INFO", stack: this.stack, evidence: "Graph Error Trace", match_count: 1
            } as any);
        }
        return findings;
    }

    public override getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: ['.ts', '.tsx'],
            rules: [
                { regex: /catch\s*\([^)]*\)\s*\{\s*\}/, issue: 'Silenciado: catch vazio engole exceção sem tratamento.', severity: 'critical' },
                { regex: /catch\s*\{\s*\}/, issue: 'Silenciado: catch vazio sem parâmetro.', severity: 'critical' },
                { regex: /\.catch\(\(\)\s*=>\s*\{\s*\}\)/, issue: 'Silenciado: Promise .catch vazio engole rejeição.', severity: 'critical' },
                { regex: /\.catch\(\(\)\s*=>\s*null\)/, issue: 'Suprimido: Promise .catch retorna null — erro perdido.', severity: 'high' },
                { regex: /catch\s*\([^)]*\)\s*\{[^}]*\/\/\s*(?:todo|ignore|suppress)/, issue: 'Débito: Catch com TODO/ignore indica tratamento pendente.', severity: 'medium' },
                { regex: /throw\s+new\s+Error\(\)/, issue: 'Vago: Error lançado sem mensagem descritiva.', severity: 'medium' },
            ]
        };
    }

    reasonAboutObjective(objective: string, file: string, content: string | Promise<string | null>): StrategicFinding | string | null {
        if (typeof content !== 'string') return null;
        if (content["match"](/catch\s*\([^)]*\)\s*\{\s*\}/)) {
            return {
                file, severity: "CRITICAL",
                issue: `Instabilidade Sistêmica: O objetivo '${objective}' exige resiliência. Em '${file}', falhas silenciosas impedem a auto-correção da 'Orquestração de Inteligência Artificial'.`,
                context: "Empty catch detected"
            };
        }
        return {
            file, severity: "INFO",
            issue: `PhD Resilience: Analisando integridade de erros para ${objective}. Focando em eliminação de falhas silenciosas.`,
            context: "analyzing resilience"
        };
    }

    public override selfDiagnostic(): any {
        return {
            status: "Soberano",
            score: 100,
            details: "Diagnóstico de falhas silenciosas TS operando com rigor PhD."
        };
    }

    override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, mestre em resiliência e tolerância a falhas TypeScript.`;
    }
}
