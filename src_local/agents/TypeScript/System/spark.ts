import { BaseActivePersona } from "../../base.ts";
import type { AuditRule, StrategicFinding, ProjectContext, AuditFinding } from "../../base.ts";

/**
 * ✨ Dr. Spark — PhD in TypeScript Developer Experience & CLI Engagement
 * Especialista em UX de ferramentas, feedback visual e experiência do desenvolvedor.
 */
export class SparkPersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Spark";
        this.emoji = "✨";
        this.role = "PhD Developer Experience Engineer";
        this.phd_identity = "Developer Experience & UX Tooling (TypeScript)";
        this.stack = "TypeScript";
    }

    public override async execute(context: ProjectContext): Promise<(AuditFinding | StrategicFinding)[]> {
        this.setContext(context);
        const findings: (AuditFinding | StrategicFinding)[] = await this.performAudit();
        return findings;
    }

    override getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: ['.ts', '.tsx'],
            rules: [
                { regex: /process\.exit\(\d+\)(?![\s\S]{0,30}console|log|error)/, issue: 'Saída Silenciosa: process.exit() sem aviso ao dev. Forneça contexto visível PhD.', severity: 'medium' },
                { regex: /throw\s+new\s+Error\(["']["']\)/, issue: 'Erro Mudo: Error lançado com mensagem vazia PhD.', severity: 'medium' },
                { regex: /\.on\(["']error["']\s*,\s*\(\)\s*=>\s*\{\s*\}\)/, issue: 'Erro Invisível: Event handler de erro vazio (engolido) PhD.', severity: 'high' },
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

    public override reasonAboutObjective(objective: string, file: string, content: string | Promise<string | null>): StrategicFinding | null {
        if (typeof content === 'string' && /process\.exit\(\d+\)/.test(content)) {
            return {
                file, severity: "STRATEGIC",
                issue: `Interface Árida: O objetivo '${objective}' exige percepção humanizada. Em '${file}', saídas silenciosas afetam a DX PhD.`,
                context: "process.exit detected"
            };
        }
        return {
            file, severity: "INFO",
            issue: `PhD Spark (TypeScript): Analisando Developer Experience para ${objective}. Focando em diagnóstico e engajamento.`,
            context: this.name
        };
    }

    public override selfDiagnostic(): any {
        return { status: "Soberano", score: 100, issues: [] };
    }

    public override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, mestre em engajamento e experiência do desenvolvedor TypeScript.`;
    }
}
