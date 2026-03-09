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
        this.stack = "Python";
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

