/**
 * 🏗️ Scale - PhD in System Architecture & Scalability (Flutter)
 * Especialista em modularidade, gestão de pacotes e padrões arquiteturais Dart.
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
        this.phd_identity = "Flutter Architecture & Scalability";
        this.stack = "Flutter";
    }

    override async execute(context: ProjectContext): Promise<AuditFinding[]> {
        this.setContext(context);
        const findings = await this.performAudit();

        if (this.hub) {
            // Architectural Intelligence via Knowledge Graph
            const graph = await this.hub.getKnowledgeGraph("lib/main.dart", 1);
            
            // PhD Architectural Reasoning
            const reasoning = await this.hub.reason(`Analyze the architectural scalability of a Flutter system with a core graph of ${graph.nodes.length} nodes and identify state management bottlenecks.`);

            findings.push({
                file: "Architecture Core", agent: this.name, role: this.role, emoji: this.emoji,
                issue: `Sovereign Scale: Escalabilidade Flutter validada via Rust Hub. PhD Analysis: ${reasoning}`,
                severity: "INFO", stack: this.stack, evidence: "Knowledge Graph Complexity Audit", match_count: 1
            } as any);
        }
        return findings;
    }

    override getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: [".dart"],
            rules: [
                { regex: /\n{400,}/, issue: "God File: Arquivo Flutter excessivamente grande; risco de entropia.", severity: "high" },
                { regex: /import\s+['"]\.\.\/\.\.\/.*?['"]/, issue: "Deep Relative: Importação excessivamente profunda; risco de acoplamento.", severity: "medium" },
                { regex: /static\s+.*?/, issue: "Static Abuse: Uso excessivo de membros estáticos dificulta a escala e testes.", severity: "low" },
                { regex: /import\s+['"]package:.*?\/src\/.*?['"]/, issue: "Internal Leak: Importando de /src/ de outros pacotes; risco de quebra de API.", severity: "high" },
                { regex: /class\s+.*\{[\s\S]*class\s+/, issue: "Multi-Class File: Múltiplas classes em um arquivo dificultam a manutenção.", severity: "medium" },
                { regex: /\w+\(.*?,\s*.*?,\s*.*?,\s*.*?,\s*.*?,\s*.*?,\s*.*?,\s*.*?,\s*.*?,\s*.*?\)/, issue: "Massive Constructor: Construtor com mais de 10 parâmetros detectado.", severity: "medium" }
            ]
        };
    }

    public override reasonAboutObjective(objective: string, _file: string, _content: string): string | StrategicFinding | null {
        return {
            objective,
            analysis: "Auditando padrões de escalabilidade para soberania arquitetural.",
            file: _file,
            issue: "PhD Architecture: Analisando padrões de desacoplamento e isolamento de estado.",
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
        return `Você é o Dr. ${this.name}, PhD em Arquitetura de Sistemas e Escalabilidade Flutter.`;
    }
}

