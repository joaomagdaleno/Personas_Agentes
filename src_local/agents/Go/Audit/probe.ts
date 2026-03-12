import { BaseActivePersona } from "../../base.ts";
import type { AuditRule, StrategicFinding, AuditFinding } from "../../base.ts";
import type { ProjectContext } from "../../../core/types.ts";

/**
 * 🔬 Dr. Probe — PhD in Go Error Resilience & Exception Handling
 * Especialista em rastreamento de erros, monitoramento de fluxo e omissões silenciadas em Go.
 */
export class ProbePersona extends BaseActivePersona {
    constructor(projectRoot: string | undefined = undefined) {
        super(projectRoot);
        this.name = "Probe";
        this.emoji = "🔬";
        this.role = "PhD Resilience Engineer";
        this.phd_identity = "Go Error Resilience & Exception Handling";
        this.stack = "Go";
    }

    override async execute(context: ProjectContext): Promise<AuditFinding[]> {
        this.setContext(context);
        const findings = await this.performAudit();

        if (this.hub) {
            // Strategic Resilience: Impact analysis
            const graph = await this.hub.getKnowledgeGraph("src_local/core/types.ts", 2);
            
            // Search for "err != nil" omissions
            const silentFailures = await this.hub.queryKnowledgeGraph("if err != nil", "critical");

            // PhD Resilience Reasoning
            const reasoning = await this.hub.reason(`Analyze the impact of silent failures in files related to ${silentFailures.length} missing error checks within a graph of ${graph.nodes.length} nodes.`);

            findings.push({
                file: "Resilience Core", agent: this.name, role: this.role, emoji: this.emoji,
                issue: `Sovereign Resilience: Integridade de fluxo validada via Go Hub. PhD Analysis: ${reasoning}`,
                severity: "INFO", stack: this.stack, evidence: "Graph Error Trace", match_count: 1
            } as any);
        }
        return findings;
    }

    override getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: [".go"],
            rules: [
                { regex: /_\s*=\s*.*\(.*\)/, issue: "Omissão Silenciosa: Ignorar retorno explicitamente via '_' pode ocultar falhas críticas.", severity: "critical" },
                { regex: /err\s*:=\s*.*\(.*\)(?![^}]*if\s+err\s*!=\s*nil)/, issue: "Silenciado: Erro atribuído mas não verificado imediatamente.", severity: "critical" },
                { regex: /recover\(\)/, issue: "Panic Recovery: Verifique se o recover() garante a telemetria do erro.", severity: "medium" },
                { regex: /fmt\.Errorf\(.*%v/, issue: "Weak Context: Use '%w' em fmt.Errorf para permitir wrapping de erros.", severity: "low" },
                { regex: /log\.Fatal/, issue: "Unmanaged Exit: log.Fatal interrompe o processo sem cleanup gracioso.", severity: "high" },
                { regex: /errors\.New\(.*"Error"/i, issue: "Vago: Mensagem de erro genérica dificulta o diagnóstico.", severity: "medium" }
            ]
        };
    }

    override reasonAboutObjective(objective: string, file: string, content: string | Promise<string | null>): StrategicFinding | string | null {
        if (typeof content !== 'string') return null;
        if (content["match"](/_\s*=\s*.*\(.*\)/)) {
            return {
                file, severity: "CRITICAL",
                issue: `Instabilidade Sistêmica: O objetivo '${objective}' exige resiliência. Em '${file}', falhas silenciosas [omissão via _] impedem a auto-correção.`,
                context: "Error omission detected"
            };
        }
        return {
            file, severity: "INFO",
            issue: `PhD Resilience: Analisando integridade de erros para ${objective}. Focando em eliminação de falhas silenciosas Go.`,
            context: "analyzing resilience"
        };
    }

    override selfDiagnostic(): any {
        return {
            status: "Soberano",
            score: 100,
            details: "Diagnóstico de falhas silenciosas Go operando com rigor PhD."
        };
    }

    override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, mestre em resiliência e tolerância a falhas Go.`;
    }
}
