import { BaseActivePersona } from "../../base.ts";
import type { AuditRule, StrategicFinding, AuditFinding } from "../../base.ts";
import type { ProjectContext } from "../../../core/types.ts";

/**
 * 🧪 Testify Persona (Rust Stack) - PhD in Quality Assurance
 */
export class TestifyPersona extends BaseActivePersona {
    constructor(projectRoot: string | undefined = undefined) {
        super(projectRoot);
        this.name = "Testify";
        this.emoji = "🧪";
        this.role = "PhD Quality Assurance Engineer";
        this.phd_identity = "Rust Test Coverage & QA";
        this.stack = "Rust";
    }

    override async execute(context: ProjectContext): Promise<any> {
        this.setContext(context);
        const findings = await this.performAudit();
        return findings;
    }

    override getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: [".rs"],
            rules: [
                { regex: /#\[test\]\s*fn\s+.*\{\s*\}/, issue: "Teste Vazio: Teste declarado sem corpo. Falsa garantia PhD.", severity: "critical" },
                { regex: /\.unwrap\(\)|\.expect\(/, issue: "Fragilidade: Uso de unwrap/expect em teste. Prefira tratamentos idiomáticos para evitar falsas falhas.", severity: "medium" },
                { regex: /unsafe\s*\{/, issue: "Risco: Bloco unsafe em teste sem justificativa. Violência contra a segurança PhD.", severity: "high" }
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

    public override reasonAboutObjective(objective: string, file: string, content: string | Promise<string | null>): StrategicFinding | null {
        if (typeof content !== 'string') return null;
        if (content.includes('unwrap()') || content.includes('expect(')) {
            return {
                file, severity: "HIGH",
                issue: `Fragilidade de Teste: O objetivo '${objective}' exige robustez Rust. Em '${file}', o uso de panic-triggers em testes viola a 'Orquestração de Inteligência Artificial'.`,
                context: "panic triggers in test"
            };
        }
        return {
            file, severity: "INFO",
            issue: `PhD Quality (Rust): Analisando suíte para ${objective}. Focando em ausência de unsafe e estabilidade.`,
            context: "analyzing quality"
        };
    }

    override selfDiagnostic(): any {
        return { status: "Soberano", score: 100, details: "Módulo de Qualidade Rust operando com precisão PhD." };
    }

    override getSystemPrompt(): string {
        return `Você é o Dr. Testify, PhD em verificação formal e testes de sistemas de missão crítica em Rust.`;
    }
}
