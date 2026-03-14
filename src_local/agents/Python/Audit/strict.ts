import { BaseActivePersona } from "../../base.ts";
import type { AuditRule, StrategicFinding, AuditFinding, ProjectContext } from "../../base.ts";

/**
 * 🔒 Strict - PhD in Compiler Rigor & Type Purity (Python)
 */
export class StrictPersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Strict";
        this.emoji = "🔒";
        this.role = "PhD Memory Safety Guardian";
        this.phd_identity = "Type Checking Rigor & Purity (Python)";
        this.stack = "Python";
    }

    public override async execute(context: ProjectContext): Promise<(AuditFinding | StrategicFinding)[]> {
        this.setContext(context);
        const findings: (AuditFinding | StrategicFinding)[] = await this.performAudit();
        return findings;
    }

    override getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: [".py"],
            rules: [
                { regex: /:\s*Any\b/i, issue: "Laxidade PhD: Uso de 'Any' detectado. Especifique tipos concretos para garantir integridade.", severity: "high" },
                { regex: /def\s+\w+\(.*\)\s*:/, issue: "Ambiguidade: Assinatura sem type hint de retorno (->). PhD exige clareza analítica.", severity: "medium" },
                { regex: /type\(.*\)\s*==\s*/, issue: "Fragilidade: Verificação de tipo via type() ==. Use isinstance() para robustez PhD.", severity: "low" }
            ]
        };
    }

    public override async performAudit(): Promise<AuditFinding[]> {
        this.startMetrics();
        const rules = this.getAuditRules();
        const results = await this.findPatterns(rules.extensions, rules.rules);
        this.endMetrics(results.length);
        return results;
    }

    public Branding(): string { return `${this.emoji} ${this.name}`; }

    public override reasonAboutObjective(objective: string, file: string, _content: string | Promise<string | null>): StrategicFinding | null {
        return {
            file,
            severity: "INFO",
            issue: `PhD Strict (Python): Analisando rigor para ${objective}.`,
            context: "analyzing strictness"
        };
    }

    public override selfDiagnostic(): any {
        return { status: "Soberano", score: 100, issues: [], branding: this.Branding() };
    }

    public override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, PhD em rigor Python.`;
    }
}
