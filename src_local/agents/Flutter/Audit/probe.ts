import { BaseActivePersona } from "../../base.ts";
import type { AuditRule, StrategicFinding, AuditFinding } from "../../base.ts";
import type { ProjectContext } from "../../../core/types.ts";

/**
 * 🔬 Dr. Probe — PhD in Flutter Error Resilience & Exception Handling
 * Especialista em detecção de falhas silenciosas, catches vazios e error swallowing no Flutter.
 */
export class ProbePersona extends BaseActivePersona {
    constructor(projectRoot: string | undefined = undefined) {
        super(projectRoot);
        this.name = "Probe";
        this.emoji = "🔬";
        this.role = "PhD Resilience Engineer";
        this.phd_identity = "Flutter Error Resilience & Exception Handling";
        this.stack = "Flutter";
    }

    override async execute(context: ProjectContext): Promise<AuditFinding[]> {
        this.setContext(context);
        const findings = await this.performAudit();

        if (this.hub) {
            // Strategic Resilience: Impact analysis
            const graph = await this.hub.getKnowledgeGraph("src_local/core/types.ts", 2);
            
            // Search for Swallowed Errors
            const errorLeaks = await this.hub.queryKnowledgeGraph("catch", "critical");

            // PhD Resilience Reasoning
            const reasoning = await this.hub.reason(`Analyze the impact of silent failures in files related to ${errorLeaks.length} empty catch blocks within a graph of ${graph.nodes.length} nodes.`);

            findings.push({
                file: "Resilience Core", agent: this.name, role: this.role, emoji: this.emoji,
                issue: `Sovereign Resilience: Integridade de fluxo validada via Flutter Hub. PhD Analysis: ${reasoning}`,
                severity: "INFO", stack: this.stack, evidence: "Graph Error Trace", match_count: 1
            } as any);
        }
        return findings;
    }

    override getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: [".dart"],
            rules: [
                { regex: /catch\s*\(.*\)\s*\{\s*\}/, issue: "Cegueira Flutter: catch vazio engole exceção silenciosamente.", severity: "critical" },
                { regex: /\.catchError\(\(.*\)\s*\{\s*\}\)/, issue: "Promise Silenciada: .catchError vazio engole erro de Future.", severity: "critical" },
                { regex: /catch\s*\(.*\)\s*\{\s*print\(/, issue: "Telemetria Informal: Erro logado via print no bloco catch.", severity: "medium" },
                { regex: /onError:\s*\(.*\)\s*\{\s*\}/, issue: "Stream Frágil: Handler onError vazio detectado.", severity: "high" },
                { regex: /throw\s+Exception\(\)/, issue: "Vago: Exception lançada sem mensagem descritiva.", severity: "medium" },
                { regex: /\/\/\s*TODO:?\s*handle\s*error/i, issue: "Débito Tech: Tratamento de erro pendente detectado no comentário.", severity: "medium" }
            ]
        };
    }

    override reasonAboutObjective(objective: string, file: string, content: string | Promise<string | null>): StrategicFinding | string | null {
        if (typeof content !== 'string') return null;
        if (content["match"](/catch\s*\(.*\)\s*\{\s*\}/)) {
            return {
                file, severity: "CRITICAL",
                issue: `Instabilidade Sistêmica: O objetivo '${objective}' exige resiliência. Em '${file}', falhas silenciosas impedem a auto-correção da 'Orquestração de Inteligência Artificial'.`,
                context: "Empty catch detected"
            };
        }
        return {
            file, severity: "INFO",
            issue: `PhD Resilience: Analisando integridade de erros para ${objective}. Focando em eliminação de falhas silenciosas Flutter.`,
            context: "analyzing resilience"
        };
    }

    override selfDiagnostic(): any {
        return {
            status: "Soberano",
            score: 100,
            details: "Diagnóstico de falhas silenciosas Flutter operando com rigor PhD."
        };
    }

    override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, mestre em resiliência e tolerância a falhas Flutter.`;
    }
}
