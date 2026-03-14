import { BaseActivePersona } from "../../base.ts";
import type { AuditFinding, AuditRule, StrategicFinding, ProjectContext } from "../../base.ts";

/**
 * 🧪 Testify Persona (Go Stack) - PhD in Quality Assurance
 */
export class TestifyPersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Testify";
        this.emoji = "🧪";
        this.role = "PhD Quality Assurance Engineer";
        this.phd_identity = "Go Testing & Verification Specialist";
        this.stack = "Go";
    }

    public override async execute(context: ProjectContext): Promise<(AuditFinding | StrategicFinding)[]> {
        this.setContext(context);
        const findings: (AuditFinding | StrategicFinding)[] = await this.performAudit();
        return findings;
    }

    override getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: [".go"],
            rules: [
                { regex: /func\s+Test.*\{\s*}/, issue: "Empty Test detectado. Testes vazios não garantem a soberania da lógica PhD.", severity: "critical" },
                { regex: /,\s*err\s*:=\s*.*(?![\s\S]*if\s+err\s*!=\s*nil)/, issue: "Risco de Pânico: Erro obtido no teste mas não verificado. PhD exige assertiva rigorosa.", severity: "high" },
                { regex: /func\s+Test.*\{[\s\S]{500,}\}(?![\s\S]*t\.Run)/, issue: "Legibilidade: Teste longo sem subtests (t.Run). Dificulta isolamento de falhas PhD.", severity: "medium" }
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

    public override reasonAboutObjective(objective: string, file: string, _content: string | Promise<string | null>): StrategicFinding | null {
        return {
            file,
            issue: `PhD Testify (Go): Analisando qualidade para ${objective}.`,
            severity: "STRATEGIC",
            context: this.name
        };
    }

    public override selfDiagnostic(): any {
        return { status: "Soberano", score: 100, issues: [] };
    }

    public override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, PhD em testes Go.`;
    }
}
