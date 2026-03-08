import type { AuditFinding, StrategicFinding } from "../../base.ts";
import { BaseActivePersona } from "../../base.ts";

/**
 * 🕉️ Mantra - PhD in Consistent Logic (Python Stack)
 */
export class MantraPersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Mantra";
        this.emoji = "🕉️";
        this.role = "PhD Logic Philosopher";
        this.stack = "Python";
    }

    public override async performAudit(): Promise<AuditFinding[]> {
        this.startMetrics();
        const results = await this.findPatterns([".py"], [
            { regex: /TODO|FIXME/, issue: "Dívida Filosófica: Pendências detectadas que quebram o mantra de perfeição.", severity: "medium" }
        ]);
        this.endMetrics(results.length);
        return results;
    }

    public override reasonAboutObjective(objective: string, _file: string, _content: string): StrategicFinding | null {
        return {
            file: "logic",
            issue: `Evolução do Mantra para ${objective}: Mantendo a pureza da lógica fundamental.`,
            severity: "STRATEGIC",
            context: this.name
        };
    }

    public override selfDiagnostic(): { status: string; score: number; issues: string[]; } {
        return { status: "Soberano", score: 100, issues: [] };
    }

    public override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, PhD em Filosofia Lógica Python.`;
    }
}

