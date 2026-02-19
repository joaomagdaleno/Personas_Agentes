import type { AuditFinding, StrategicFinding } from "../../base.ts";
import { BaseActivePersona } from "../../base.ts";

/**
 * 🔫 Warden - PhD in Enforcement & Compliance (Python Stack)
 */
export class WardenPersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Warden";
        this.emoji = "🔫";
        this.role = "PhD Enforcement Officer";
        this.stack = "Python";
    }

    public override performAudit(): AuditFinding[] {
        this.startMetrics();
        const results = this.findPatterns([".py"], [
            { regex: /os\.system/, issue: "Execução Fora de Controle: O Warden exige o uso de subprocess.run para conformidade.", severity: "high" }
        ]);
        this.endMetrics(results.length);
        return results;
    }

    public override reasonAboutObjective(objective: string, _file: string, _content: string): StrategicFinding | null {
        return {
            file: "compliance",
            issue: `Auditoria do Warden para ${objective}: Garantindo execução rigorosa das leis PhD.`,
            severity: "STRATEGIC",
            context: this.name
        };
    }

    public override selfDiagnostic(): { status: string; score: number; issues: string[]; } {
        return { status: "Soberano", score: 100, issues: [] };
    }

    public override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, PhD em Execução de Conformidade Python.`;
    }
}
