import { BaseActivePersona } from "../../base.ts";
import type { AuditRule, StrategicFinding, AuditFinding } from "../../base.ts";
import type { ProjectContext } from "../../../core/types.ts";

/**
 * 🧪 Testify Persona (Kotlin Stack) - PhD in Quality Assurance
 */
export class TestifyPersona extends BaseActivePersona {
    constructor(projectRoot: string | undefined = undefined) {
        super(projectRoot);
        this.name = "Testify";
        this.emoji = "🧪";
        this.role = "PhD Quality Assurance Engineer";
        this.phd_identity = "Kotlin Test Coverage & QA";
        this.stack = "Kotlin";
    }

    override async execute(context: ProjectContext): Promise<any> {
        this.setContext(context);
        const findings = await this.performAudit();
        return findings;
    }

    override getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: [".kt"],
            rules: [
                { regex: /@Test\s+fun\s+\w+\(\)\s*{\s*}/, issue: "Teste Vazio: Função sem corpo detectada. Falsa cobertura PhD.", severity: "critical" },
                { regex: /!!\./, issue: "Fragilidade: Non-null assertion (!!) em teste. Pode causar falhas de runtime sem rastreabilidade PhD.", severity: "medium" },
                { regex: /try\s*{[\s\S]*?}\s*catch\s*\(e:\s*Exception\)\s*{\s*}/, issue: "Silenciamento: Catch de exceção vazio em teste. Oculta comportamentos anômalos.", severity: "high" }
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
        if (content.includes('!!.')) {
            return {
                file, severity: "HIGH",
                issue: `Instabilidade de Teste: O objetivo '${objective}' exige segurança Kotlin. O uso de !! em '${file}' viola a integridade da 'Orquestração de IA'.`,
                context: "non-null assertion in test"
            };
        }
        return {
            file, severity: "INFO",
            issue: `PhD Quality (Kotlin): Analisando suíte para ${objective}. Focando em segurança de tipos e cobertura real.`,
            context: "analyzing quality"
        };
    }

    override selfDiagnostic(): any {
        return { status: "Soberano", score: 100, details: "Módulo de Qualidade Kotlin operando com rigor PhD." };
    }

    override getSystemPrompt(): string {
        return `Você é o Dr. Testify, PhD em qualidade de software e testes robustos para o ecossistema Kotlin/JVM.`;
    }
}
