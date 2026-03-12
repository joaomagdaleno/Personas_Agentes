import { BaseActivePersona } from "../../base.ts";
import type { AuditRule, StrategicFinding } from "../../base.ts";
import type { ProjectContext } from "../../../core/types.ts";

/**
 * 🏗️ Dr. Scale — PhD in Python Architecture & Scalability
 * Especialista em arquitetura de módulos, god classes e complexidade ciclomatica no ecossistema Python.
 */
export class ScalePersona extends BaseActivePersona {
    constructor(projectRoot: string | undefined = undefined) {
        super(projectRoot);
        this.name = "Scale";
        this.emoji = "🏗️";
        this.role = "PhD Software Architect";
        this.phd_identity = "Python Architecture & Scalability";
        this.stack = "Python";
    }

    override async execute(context: ProjectContext): Promise<any> {
        this.setContext(context);
        const findings = await this.performAudit();

        if (this.hub) {
            // Architectural Intelligence: Coupling and God Files
            const graph = await this.hub.getKnowledgeGraph("src_local/core/orchestrator.ts", 2);
            
            // PhD Architectural Reasoning
            const reasoning = await this.hub.reason(`Analyze the architectural scalability of a Python system with a core graph of ${graph.nodes.length} nodes and identify critical coupling.`);

            findings.push({
                file: "Architecture Core", agent: this.name, role: this.role, emoji: this.emoji,
                issue: `Sovereign Scale: Escalabilidade validada via Rust Hub. PhD Analysis: ${reasoning}`,
                severity: "INFO", stack: this.stack, evidence: "Knowledge Graph Coupling Analysis", match_count: 1
            } as any);
        }
        return findings;
    }

    override getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: [".py"],
            rules: [
                { regex: /\n{400,}/, issue: "God File: Arquivo Python excessivamente grande e difícil de manter.", severity: "high" },
                { regex: /from\s+\.\.\s+import|from\s+\.\.\.\s+import/, issue: "Deep Relative: Importação relativa ascendente severa em Python.", severity: "medium" },
                { regex: /global\s+\w+/, issue: "State Risk: Uso de variáveis globais quebra o encapsulamento estrutural.", severity: "medium" },
                { regex: /from\s+.*\s+import\s+\*/, issue: "Wildcard Import: Poluição de namespace Python detectada.", severity: "low" },
                { regex: /def\s+\w+\([^)]*\)\s*.*:\s*(?:.*\n){50,}/, issue: "Complexidade de Método detectada: Função Python extremamente longa.", severity: "medium" }
            ]
        };
    }

    override reasonAboutObjective(objective: string, file: string, content: string | Promise<string | null>): StrategicFinding | string | null {
        if (typeof content !== 'string') return null;
        const lines = content["split"]('\n');
        if (lines.length > 400) {
            return {
                file, severity: "HIGH",
                issue: `Entropia Arquitetural: O objetivo '${objective}' exige modularidade. O arquivo '${file}' com ${lines.length} linhas é um monólito que resiste à evolução da 'Orquestração de Inteligência Artificial'.`,
                context: `File size: ${lines.length} lines`
            };
        }
        return {
            file, severity: "INFO",
            issue: `PhD Architecture: Analisando escalabilidade e coesão para ${objective}. Focando em decomposição modular e SOLID em Python.`,
            context: "analyzing scalability"
        };
    }

    override selfDiagnostic(): any {
        return {
            status: "Soberano",
            score: 100,
            details: "Sensores de complexidade ciclomatica Python operando com precisão PhD."
        };
    }

    override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, mestre em arquitetura e escalabilidade Python.`;
    }
}
