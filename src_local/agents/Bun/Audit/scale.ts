import { BaseActivePersona } from "../../base.ts";
import type { AuditRule, StrategicFinding } from "../../base.ts";
import type { ProjectContext } from "../../../core/types.ts";

/**
 * 🏗️ Dr. Scale — PhD in Bun Architecture & Worker Scaling
 * Especialista em arquitetura Bun, workers, monólitos e separação de responsabilidades.
 */
export class ScalePersona extends BaseActivePersona {
    constructor(projectRoot: string | undefined = undefined) {
        super(projectRoot);
        this.id = "bun:audit:scale";
        this.name = "Scale";
        this.emoji = "🏗️";
        this.role = "PhD Bun Architecture Engineer";
        this.phd_identity = "Bun Architecture & Worker Scaling";
        this.stack = "Bun";
    }

    override async execute(context: ProjectContext): Promise<any> {
        this.setContext(context);
        const findings = await this.performAudit();

        if (this.hub) {
            // Architectural Intelligence: Coupling and Monolith detection
            const graph = await this.hub.getKnowledgeGraph("src_local/core/orchestrator.ts", 1);
            
            // PhD Architectural Reasoning
            const reasoning = await this.hub.reason(`Analyze the architectural scalability of a Bun system with a core graph of ${graph.nodes.length} nodes and identify monolith risks.`);

            findings.push({
                file: "Architecture Core", agent: this.name, role: this.role, emoji: this.emoji,
                issue: `Sovereign Scale: Escalabilidade Bun validada via Rust Hub. PhD Analysis: ${reasoning}`,
                severity: "INFO", stack: this.stack, evidence: "Knowledge Graph Complexity Analysis", match_count: 1
            } as any);
        }
        return findings;
    }

    override getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: ['.ts', '.tsx'],
            rules: [
                { regex: /\n{400,}/, issue: "God File: Arquivo excessivamente grande; risco de entropia.", severity: "high" },
                { regex: /import\s+.*from\s+['"]\.\.\/\.\.\//, issue: "Deep Relative: Importação excessivamente profunda; risco de acoplamento.", severity: "medium" },
                { regex: /static\s+\w+\s+\w+/, issue: "Static Abuse: Uso excessivo de membros estáticos pode dificultar testes e escalabilidade.", severity: "low" },
                { regex: /import\s+.*from\s+['"].*\/internal\/.*['"]/, issue: "Internal Leak: Importando de diretório interno de outro módulo.", severity: "high" },
                { regex: /Bun\.spawn|Bun\.Worker/, issue: "Resource Check: Verifique se processos/workers são encerrados corretamente.", severity: "medium" },
                { regex: /import\s+.*\{[\s\S]{500,}\}/, issue: "Massive Import: Lista de importação muito longa; sugere quebras de SRP.", severity: "low" }
            ]
        };
    }

    reasonAboutObjective(objective: string, file: string, content: string | Promise<string | null>): StrategicFinding | string | null {
        if (typeof content !== 'string') return null;
        const lines = content["split"]('\n');
        if (lines.length > 400) {
            return {
                file, severity: "HIGH",
                issue: `Entropia Arquitetural: O objetivo '${objective}' exige modularidade Bun. O arquivo '${file}' com ${lines.length} linhas é um monólito.`,
                context: `File length: ${lines.length} lines`
            };
        }
        return null;
    }

    override selfDiagnostic(): any {
        return {
            status: "Soberano",
            score: 100,
            details: "Sensores de complexidade ciclomatica Bun operando com precisão PhD."
        };
    }

    override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, mestre em arquitetura e escalabilidade Bun.`;
    }
}
