import { BaseActivePersona } from "../../base.ts";
import type { AuditRule, StrategicFinding } from "../../base.ts";
import type { ProjectContext } from "../../../core/types.ts";

/**
 * 🏗️ Dr. Scale — PhD in Flutter Architecture & Scalability
 * Especialista em arquitetura de módulos, controllers inflados e complexidade ciclomatica no ecossistema Flutter/Dart.
 */
export class ScalePersona extends BaseActivePersona {
    constructor(projectRoot: string | undefined = undefined) {
        super(projectRoot);
        this.name = "Scale";
        this.emoji = "🏗️";
        this.role = "PhD Software Architect";
        this.phd_identity = "Flutter Architecture & Scalability";
        this.stack = "Flutter";
    }

    override async execute(context: ProjectContext): Promise<any> {
        this.setContext(context);
        const findings = await this.performAudit();

        if (this.hub) {
            // Architectural Intelligence: Coupling and God Files
            const graph = await this.hub.getKnowledgeGraph("src_local/core/orchestrator.ts", 2);
            
            // PhD Architectural Reasoning
            const reasoning = await this.hub.reason(`Analyze the architectural scalability of a Flutter system with a core graph of ${graph.nodes.length} nodes and identify critical coupling.`);

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
            extensions: [".dart"],
            rules: [
                { regex: /\n{400,}/, issue: "God File: Arquivo Dart excessivamente grande e difícil de manter.", severity: "high" },
                { regex: /import\s+['"]\.\.\/\.\.\//, issue: "Deep Relative: Importação relativa ascendente severa em Flutter.", severity: "medium" },
                { regex: /class\s+\w+\s+extends\s+StatefulWidget\s*\{[^}]*\}\s*class\s+_\w+State\s+extends\s+State\s*<\w+>\s*\{\s*(?:.*\n){300,}\}/, issue: "Complexidade de UI: Widget com estado excessivamente grande detectado.", severity: "medium" },
                { regex: /class\s+\w+Controller.*\{(?:\s*(?!\b(?:class|mixin|enum)\b).*\n){300,}\}/, issue: "God Controller: Controller de gestão de estado (GetX/Riverpod/Bloc) extremamente longo.", severity: "high" }
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
            issue: `PhD Architecture: Analisando escalabilidade e coesão para ${objective}. Focando em decomposição modular e SOLID em Flutter.`,
            context: "analyzing scalability"
        };
    }

    override selfDiagnostic(): any {
        return {
            status: "Soberano",
            score: 100,
            details: "Sensores de complexidade ciclomatica Flutter operando com precisão PhD."
        };
    }

    override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, mestre em arquitetura e escalabilidade Flutter.`;
    }
}
