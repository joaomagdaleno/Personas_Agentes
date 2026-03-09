import type { AuditFinding, StrategicFinding } from "../../base.ts";
import { BaseActivePersona } from "../../base.ts";

/**
 * 🎓 Director - PhD in Strategic Orchestration (Python Stack)
 */
export class DirectorPersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Director";
        this.emoji = "🎓";
        this.role = "PhD Strategic Director";
        this.stack = "Python";
    }

    public override async performAudit(): Promise<AuditFinding[]> {
        this.startMetrics();
        const results = await this.findPatterns([".py"], [
            { regex: /import orchestrator/, issue: "Integridade de Orquestração: Verifique se o diretor mantém o controle centralizado.", severity: "low" }
        ]);
        this.endMetrics(results.length);
        return results;
    }

    public override reasonAboutObjective(objective: string, _file: string, _content: string): StrategicFinding | null {
        return {
            file: "orchestration",
            issue: `Direcionamento Estratégico para ${objective}: Garantindo alinhamento com a visão PhD.`,
            severity: "STRATEGIC",
            context: this.name
        };
    }

    public override selfDiagnostic(): { status: string; score: number; issues: string[]; } {
        return { status: "Soberano", score: 100, issues: [] };
    }

    public override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, PhD em Orquestração Estratégica Python.`;
    }
}

