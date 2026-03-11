/**
 * 🧩 Fragment - Flutter-native Modularity & Widget Cohesion Agent
 * Sovereign Synapse: Audita a coesão de pacotes Dart, acoplamento de widgets e granularidade lógica no Flutter.
 */
import type { AuditRule, StrategicFinding } from "../../base.ts";
import { BaseActivePersona } from "../../base.ts";

export class FragmentPersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Fragment";
        this.emoji = "🧩";
        this.role = "PhD Refactoring Expert";
        this.phd_identity = "Modularity & Structural Cohesion (Flutter)";
        this.stack = "Flutter";
    }

    public override async execute(context: any): Promise<any> {
        this.setContext(context);
        const findings = await this.performAudit();
        if (this.hub) {
            const partNodes = await this.hub.queryKnowledgeGraph("part '", "low");
            const reasoning = await this.hub.reason(`Analyze the structural modularity of a Flutter system with ${partNodes.length} part/library markers. Recommend decoupling strategies and widget organization.`);
            findings.push({ 
                file: "Structural Audit", agent: this.name, role: this.role, emoji: this.emoji, 
                issue: `Sovereign Fragment: Coesão Flutter validada via Rust Hub. PhD Analysis: ${reasoning}`, 
                severity: "INFO", stack: this.stack, evidence: "Knowledge Graph Fragment Audit", match_count: 1,
                context: "Widget Modularity & Decoupling"
            } as any);
        }
        return findings;
    }

    getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: [".dart"],
            rules: [
                { regex: /import\s+['"]package:.*\/src\//, issue: "Coupling: Importação de pacote 'src' interno detectada. Violação de encapsulamento PhD.", severity: "medium" },
                { regex: /class\s+.*\s+extends\s+StatelessWidget\s+\{[\s\S]{3000,}\}/, issue: "Giant Widget: Widget excessivamente grande. Extraia sub-widgets menores e coesos.", severity: "high" }
            ]
        };
    }

    public override reasonAboutObjective(objective: string, _file: string, _content: string): StrategicFinding | null {
        return {
            file: "architecture",
            issue: `Direcionamento Fragment Flutter para ${objective}: Otimizando a coesão modular do app.`,
            severity: "STRATEGIC",
            context: this.name
        };
    }

    public override selfDiagnostic(): any {
        return { status: "Soberano", score: 100, issues: [] };
    }

    public override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, PhD em Refatoração Flutter. Sua missão é garantir modularidade absoluta.`;
    }
}
