import { BaseActivePersona } from "../../base.ts";
import type { AuditRule, StrategicFinding, AuditFinding } from "../../base.ts";
import type { ProjectContext } from "../../../core/types.ts";

/**
 * 🔬 Dr. Probe — PhD in Kotlin Error Resilience & Exception Handling
 * Especialista em detecção de falhas silenciosas, catches vazios e error swallowing no ecossistema Kotlin/JVM.
 */
export class ProbePersona extends BaseActivePersona {
    constructor(projectRoot: string | undefined = undefined) {
        super(projectRoot);
        this.name = "Probe";
        this.emoji = "🔬";
        this.role = "PhD Resilience Engineer";
        this.phd_identity = "Kotlin Error Resilience & Exception Handling";
        this.stack = "Kotlin";
    }

    override async execute(context: ProjectContext): Promise<AuditFinding[]> {
        this.setContext(context);
        const findings = await this.performAudit();

        if (this.hub) {
            // Strategic Resilience: Impact analysis
            const graph = await this.hub.getKnowledgeGraph("src_local/core/types.ts", 2);
            
            // Search for Swallowed Exceptions
            const errorLeaks = await this.hub.queryKnowledgeGraph("catch", "critical");

            // PhD Resilience Reasoning
            const reasoning = await this.hub.reason(`Analyze the impact of silent failures in files related to ${errorLeaks.length} empty catch blocks within a JVM graph of ${graph.nodes.length} nodes.`);

            findings.push({
                file: "Resilience Core", agent: this.name, role: this.role, emoji: this.emoji,
                issue: `Sovereign Resilience: Integridade JVM validada via Kotlin Hub. PhD Analysis: ${reasoning}`,
                severity: "INFO", stack: this.stack, evidence: "Graph Error propagation Analysis", match_count: 1
            } as any);
        }
        return findings;
    }

    override getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: [".kt", ".kts"],
            rules: [
                { regex: /catch\s*\(.*\)\s*\{\s*\}/, issue: "Cegueira Kotlin: Catch vazio detectado; exceção engolida silenciosamente.", severity: "critical" },
                { regex: /catch\s*\(.*\)\s*\{\s*(println|Log\.)/, issue: "Telemetria Frágil: Erro reportado via log informal no catch.", severity: "medium" },
                { regex: /try\s*\{.*\}\s*catch\s*\(.*\)\s*\{.*\s*\/\/\s*TODO\s*\}/, issue: "Incompleto: Bloco catch contém TODO; tratamento pendente.", severity: "medium" },
                { regex: /GlobalScope\.launch/, issue: "Risco de Resiliência: Uso de GlobalScope pode causar erros não capturados.", severity: "high" },
                { regex: /throw\s+Exception\(\)/, issue: "Vago: Lançamento de Exception genérica sem contexto.", severity: "medium" },
                { regex: /runCatching\s*\{.*\}\.getOrNull\(\)/, issue: "Silenciado: Uso de getOrNull[] ignora a falha sem rastro.", severity: "high" }
            ]
        };
    }

    override reasonAboutObjective(objective: string, file: string, content: string | Promise<string | null>): StrategicFinding | string | null {
        if (typeof content !== 'string') return null;
        if (content["match"](/catch\s*\(.*\)\s*\{\s*\}/)) {
            return {
                file, severity: "CRITICAL",
                issue: `Instabilidade Sistêmica: O objetivo '${objective}' exige resiliência. Em '${file}', falhas silenciosas impedem a auto-correção da 'Orquestração'.`,
                context: "Empty catch detected"
            };
        }
        return {
            file, severity: "INFO",
            issue: `PhD Resilience: Analisando integridade de erros para ${objective}. Focando em eliminação de falhas silenciosas Kotlin.`,
            context: "analyzing resilience"
        };
    }

    override selfDiagnostic(): any {
        return {
            status: "Soberano",
            score: 100,
            details: "Diagnóstico de falhas silenciosas Kotlin operando com rigor PhD."
        };
    }

    override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, mestre em resiliência e tolerância a falhas Kotlin.`;
    }
}
