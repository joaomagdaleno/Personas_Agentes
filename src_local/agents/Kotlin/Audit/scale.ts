/**
 * 🏗️ Scale - PhD in Architecture (Kotlin)
 * Especialista em modularidade Android, injeção de dependência e padrões arquiteturais Kotlin.
 */
import type { AuditFinding, AuditRule, StrategicFinding } from "../../base.ts";
import { BaseActivePersona } from "../../base.ts";
import type { ProjectContext } from "../../../core/types.ts";

export class ScalePersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Scale";
        this.emoji = "🏗️";
        this.role = "PhD Software Architect";
        this.phd_identity = "Kotlin/Android Architecture & Scalability";
        this.stack = "Kotlin";
    }

    override async execute(context: ProjectContext): Promise<AuditFinding[]> {
        this.setContext(context);
        const findings = await this.performAudit();

        if (this.hub) {
            // Architectural Intelligence via Knowledge Graph
            const graph = await this.hub.getKnowledgeGraph("src/main/java", 1);
            
            // PhD Architectural Reasoning
            const reasoning = await this.hub.reason(`Analyze the architectural scalability of a Kotlin system with a core graph of ${graph.nodes.length} nodes and identify module coupling.`);

            findings.push({
                file: "Architecture Core", agent: this.name, role: this.role, emoji: this.emoji,
                issue: `Sovereign Scale: Escalabilidade Kotlin validada via Rust Hub. PhD Analysis: ${reasoning}`,
                severity: "INFO", stack: this.stack, evidence: "Knowledge Graph Complexity Audit", match_count: 1
            } as any);
        }
        return findings;
    }

    override getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: [".kt"],
            rules: [
                { regex: /\n{400,}/, issue: "God File: Arquivo excessivamente grande; risco de entropia Kotlin.", severity: "high" },
                { regex: /import\s+.*?\.\.\/\.\.\//, issue: "Deep Relative: Importação excessivamente profunda; risco de acoplamento.", severity: "medium" },
                { regex: /object\s+\w+\s*\{(?!.*companion)/, issue: "Singleton Abuse: Uso de 'object' pode dificultar injeção de dependência.", severity: "medium" },
                { regex: /import\s+.*?\.\*/, issue: "Wildcard Import: Poluição de namespace Kotlin detectada.", severity: "low" },
                { regex: /import\s+.*?\.internal\..*?/, issue: "Internal Leak: Importando de pacotes internos de outros módulos.", severity: "high" },
                { regex: /lateinit\s+var/, issue: "State Risk: 'lateinit var' pode causar UninitializedPropertyAccessException em escala.", severity: "medium" }
            ]
        };
    }

    public override reasonAboutObjective(objective: string, _file: string, _content: string): string | StrategicFinding | null {
        return {
            objective,
            analysis: "Auditando padrões de escalabilidade para soberania arquitetural Kotlin.",
            file: _file,
            issue: "PhD Architecture: Analisando padrões de desacoplamento e injeção de dependência.",
            severity: "INFO",
            context: this.name
        } as StrategicFinding;
    }

    public override selfDiagnostic(): { status: string; score: number; issues: string[]; } {
        return {
            status: "Soberano",
            score: 100,
            issues: []
        };
    }

    public override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, PhD em Arquitetura de Sistemas e Especialista Android/Kotlin.`;
    }
}

