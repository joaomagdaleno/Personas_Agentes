import { BaseActivePersona } from "../../base.ts";
import type { AuditFinding, AuditRule, StrategicFinding, ProjectContext } from "../../base.ts";

/**
 * ✨ Dr. Spark — PhD in Bun Developer Experience & CLI Quality
 * Especialista em DX Bun, feedback visual e experiência de CLI.
 */
export class SparkPersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Spark";
        this.emoji = "✨";
        this.role = "PhD Bun Developer Experience Engineer";
        this.phd_identity = "Developer Experience & CLI Precision Strategies (Bun)";
        this.stack = "Bun";
    }

    public override async execute(context: ProjectContext): Promise<(AuditFinding | StrategicFinding)[]> {
        this.setContext(context);
        const findings: (AuditFinding | StrategicFinding)[] = await this.performAudit();
        return findings;
    }

    override getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: ['.ts', '.tsx', '.js'],
            rules: [
                { regex: /process\.exit\(\d+\)(?![\s\S]{0,30}console|log)/, issue: 'Saída Silenciosa: process.exit() sem aviso ao dev. Forneça contexto visível PhD.', severity: 'medium' },
                { regex: /throw\s+new\s+Error\(["']["']\)/, issue: 'Erro Mudo: Error lançado com mensagem vazia no Bun PhD.', severity: 'medium' },
                { regex: /Bun\.spawn\(\[[^\]]*\]\)(?![\s\S]{0,50}stdout|stderr)/, issue: 'Spawn Cego: Bun.spawn sem captura de stdout/stderr PhD.', severity: 'medium' },
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
                file, severity: "MEDIUM",
                issue: `DX: O objetivo '${objective}' exige interface premium. Em '${file}', saídas silenciosas prejudicam a experiência Bun PhD.`,
                context: "process.exit detected"
            };
        }
        return {
            file, severity: "INFO",
            issue: `PhD Spark (Bun): Analisando Developer Experience interativa para ${objective}.`,
            context: this.name
        };
    }

    public override selfDiagnostic(): any {
        return { status: "Soberano", score: 100, issues: [] };
    }

    public override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, mestre em DX e experiência de CLI Bun.`;
    }
}
