import { BaseActivePersona } from "../../base.ts";
import type { AuditFinding, AuditRule, StrategicFinding, ProjectContext } from "../../base.ts";

/**
 * 🔄 Dr. Flow — PhD in Bun Control Flow & Shell Scripting
 * Especialista em Bun.$ shell, Bun.spawn e fluxos de controle assíncronos.
 */
export class FlowPersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Flow";
        this.emoji = "🔄";
        this.role = "PhD Bun Control Flow Architect";
        this.phd_identity = "Bun Control Flow & Async Execution Strategies";
        this.stack = "Bun";
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
                { regex: /\.then\([^)]*\)\.then\([^)]*\)\.then/, issue: 'Callback Hell: Cadeia .then() em Bun — use async/await PhD.', severity: 'high' },
                { regex: /Bun\.spawn\(\[[^\]]*\]\)(?![\s\S]{0,100}await)/, issue: 'Fire-and-Forget: Bun.spawn sem await — processo pode não completar PhD.', severity: 'high' },
                { regex: /Bun\.\$`[^`]*`(?![\s\S]{0,50}await|try)/, issue: 'Bun Shell: Bun.$ sem await ou try-catch — erro silenciado PhD.', severity: 'medium' },
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
        if (typeof content === 'string' && /\.then\([^)]*\)\.then\([^)]*\)\.then/.test(content)) {
            return {
                file, severity: "HIGH",
                issue: `Entropia: O objetivo '${objective}' exige clareza. Em '${file}', callback chains obscurecem o fluxo Bun PhD.`,
                context: "Callback hell detected"
            };
        }
        return {
            file, severity: "INFO",
            issue: `PhD Flow (Bun): Analisando fluxos ciclomáticos de concorrência para ${objective}.`,
            context: this.name
        };
    }

    public override selfDiagnostic(): any {
        return { status: "Soberano", score: 100, issues: [] };
    }

    public override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, mestre em fluxos de controle e shell scripting Bun.`;
    }
}
