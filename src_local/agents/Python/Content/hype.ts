import type { AuditFinding, StrategicFinding } from "../../base.ts";
import { BaseActivePersona } from "../../base.ts";

/**
 * 📣 Hype - PhD in Growth & Traction (Python Stack)
 */
export class HypePersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Hype";
        this.emoji = "📣";
        this.role = "PhD Growth Lead";
        this.phd_identity = "Growth & Traction (Python)";
        this.stack = "Python";
    }

    public override async execute(context: any): Promise<any> {
        this.setContext(context);
        const findings = await this.performAudit();
        if (this.hub) {
            const metaNodes = await this.hub.queryKnowledgeGraph("setup.py", "medium");
            const reasoning = await this.hub.reason(`Analyze the product visibility of a Python project with ${metaNodes.length} metadata gaps. Recommend PyPI and documentation improvements.`);
            findings.push({ file: "Product Visibility", agent: this.name, role: this.role, emoji: this.emoji, issue: `Sovereign Hype: Visibilidade Python validada via Rust Hub. PhD Analysis: ${reasoning}`, severity: "INFO", stack: this.stack, evidence: "Knowledge Graph Metadata Audit", match_count: 1 } as any);
        }
        return findings;
    }

    public override async performAudit(): Promise<AuditFinding[]> {
        this.startMetrics();
        const results = await this.findPatterns([".py"], [
            { regex: /README\.md/, issue: "Documentação de Tração: Verifique se os benefícios técnicos são evidenciados.", severity: "low" }
        ]);
        this.endMetrics(results.length);
        return results;
    }

    public override reasonAboutObjective(objective: string, _file: string, _content: string): StrategicFinding | null {
        return {
            file: "growth",
            issue: `Análise de Hype para ${objective}: Projetando impacto e visibilidade.`,
            severity: "STRATEGIC",
            context: this.name
        };
    }

    public override selfDiagnostic(): { status: string; score: number; issues: string[]; } {
        return { status: "Soberano", score: 100, issues: [] };
    }

    public override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, PhD em Vetores de Crescimento Python.`;
    }
}

