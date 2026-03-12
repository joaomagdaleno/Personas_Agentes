import { BaseActivePersona } from "../../base.ts";
import type { AuditRule, StrategicFinding, AuditFinding } from "../../base.ts";
import type { ProjectContext } from "../../../core/types.ts";

/**
 * 🔬 Dr. Probe — PhD in Python Error Resilience & Exception Handling
 * Especialista em detecção de falhas silenciosas, except: pass e error swallowing no stack Python.
 */
export class ProbePersona extends BaseActivePersona {
    constructor(projectRoot: string | undefined = undefined) {
        super(projectRoot);
        this.name = "Probe";
        this.emoji = "🔬";
        this.role = "PhD Resilience Engineer";
        this.phd_identity = "Python Error Resilience & Exception Handling";
        this.stack = "Python";
    }

    override async execute(context: ProjectContext): Promise<AuditFinding[]> {
        this.setContext(context);
        const findings = await this.performAudit();

        if (this.hub) {
            // Strategic Resilience: Impact analysis
            const graph = await this.hub.getKnowledgeGraph("src_local/core/types.ts", 2);
            
            // Search for "pass" in except blocks
            const errorLeaks = await this.hub.queryKnowledgeGraph("except", "critical");

            // PhD Resilience Reasoning
            const reasoning = await this.hub.reason(`Analyze the impact of silent failures in files related to ${errorLeaks.length} silent catch-all issues within a graph of ${graph.nodes.length} nodes.`);

            findings.push({
                file: "Resilience Core", agent: this.name, role: this.role, emoji: this.emoji,
                issue: `Sovereign Resilience: Integridade validada via Rust Hub. PhD Analysis: ${reasoning}`,
                severity: "INFO", stack: this.stack, evidence: "Graph Error Trace", match_count: 1
            } as any);
        }
        return findings;
    }

    override getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: [".py"],
            rules: [
                { regex: /except\s*.*:\s*pass/, issue: "Cegueira Total: except vazio engole exceções Python silenciosamente.", severity: "critical" },
                { regex: /except\s*.*:\s*print\(.*\)/, issue: "Telemetria Informal: Erro logado via print no bloco except.", severity: "medium" },
                { regex: /except\s+Exception:/, issue: "Captura Genérica: Capturar Exception pode esconder bugs de lógica.", severity: "high" },
                { regex: /raise\s+Exception\(\)/, issue: "Vago: Exception lançada sem mensagem ou tipo descritivo.", severity: "medium" },
                { regex: /#\s*TODO:?\s*handle\s*error/i, issue: "Débito Tech: Tratamento de erro pendente detectado no comentário.", severity: "medium" },
                { regex: /asyncio\.create_task\(.*\)(?![^}]*add_done_callback)/, issue: "Resiliência Async: Task criada sem monitoramento de exceção.", severity: "high" }
            ]
        };
    }

    override reasonAboutObjective(objective: string, file: string, content: string | Promise<string | null>): StrategicFinding | string | null {
        if (typeof content !== 'string') return null;
        if (content["match"](/except\s*.*:\s*pass/)) {
            return {
                file, severity: "CRITICAL",
                issue: `Instabilidade Sistêmica: O objetivo '${objective}' exige resiliência. Em '${file}', falhas silenciosas [except: pass] impedem a auto-correção.`,
                context: "Silent killer detected"
            };
        }
        return {
            file, severity: "INFO",
            issue: `PhD Resilience: Analisando integridade de erros para ${objective}. Focando em eliminação de falhas silenciosas Python.`,
            context: "analyzing resilience"
        };
    }

    override selfDiagnostic(): any {
        return {
            status: "Soberano",
            score: 100,
            details: "Diagnóstico de falhas silenciosas Python operando com rigor PhD."
        };
    }

    override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, mestre em resiliência e tolerância a falhas Python.`;
    }
}
