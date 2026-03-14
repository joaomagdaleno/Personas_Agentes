import { BaseActivePersona } from "../../base.ts";
import type { AuditRule, StrategicFinding, AuditFinding, ProjectContext } from "../../base.ts";

/**
 * 🧪 Testify Persona (Python Stack) - PhD in Quality Assurance
 */
export class TestifyPersona extends BaseActivePersona {
    constructor(projectRoot: string | undefined = undefined) {
        super(projectRoot);
        this.name = "Testify";
        this.emoji = "🧪";
        this.role = "PhD Quality Assurance Engineer";
        this.phd_identity = "Python Test Coverage & QA";
        this.stack = "Python";
    }

    override async execute(context: ProjectContext): Promise<(AuditFinding | StrategicFinding)[]> {
        this.setContext(context);
        const findings: (AuditFinding | StrategicFinding)[] = await this.performAudit();
        return findings;
    }

    override getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: [".py"],
            rules: [
                { regex: /def\s+test_.*\(\s*\)\s*:\s*pass/, issue: "Teste Vazio: Definição sem corpo. PhD exige verificação real.", severity: "critical" },
                { regex: /assert\s+[^,\n]+$/, issue: "Assertiva Pobre: Uso de 'assert' sem mensagem descritiva. Dificulta diagnóstico PhD.", severity: "medium" },
                { regex: /try:[\s\S]*?except\s+Exception:[\s\S]*?pass/, issue: "Fragilidade: Try-except silenciando erros em teste. Oculta falhas sistêmicas.", severity: "high" }
            ]
        };
    }

    public override async performAudit(): Promise<any[]> {
        this.startMetrics();
        const rules = this.getAuditRules();
        const results = await this.findPatterns(rules.extensions, rules.rules);
        this.endMetrics(results.length);
        return results;
    }

    public Branding(): string { return `${this.emoji} ${this.name}`; }

    public override reasonAboutObjective(objective: string, file: string, content: string | Promise<string | null>): StrategicFinding | null {
        if (typeof content !== 'string') return null;
        if (content.includes('except Exception: pass')) {
            return {
                file, severity: "HIGH",
                issue: `Falha de Verificação: O objetivo '${objective}' exige rigor Python. Em '${file}', o silenciamento de exceções em testes viola a integridade PhD.`,
                context: "silenced exceptions in test"
            };
        }
        return {
            file, severity: "INFO",
            issue: `PhD Quality (Python): Analisando estabilidade e cobertura para ${objective}.`,
            context: "analyzing quality"
        };
    }

    override selfDiagnostic(): any {
        return { status: "Soberano", score: 100, details: "Lente de Qualidade Python com calibração PhD." };
    }

    override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, PhD em engenharia de qualidade e testes automatizados em Python.`;
    }
}
