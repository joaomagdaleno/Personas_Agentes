import { BaseActivePersona } from "../../base.ts";
import type { AuditFinding, AuditRule, StrategicFinding, ProjectContext } from "../../base.ts";

/**
 * 💾 Dr. Cache — PhD in Bun I/O Optimization & Bun.file
 * Especialista em otimização de I/O com Bun.file, Bun.write e caching.
 */
export class CachePersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Cache";
        this.emoji = "💾";
        this.role = "PhD Bun Data Layer Engineer";
        this.phd_identity = "I/O Optimization & Bun.file Engineering";
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
                { regex: /readFileSync\(/, issue: 'Bloqueio: readFileSync em Bun — use Bun.file().text() PhD.', severity: 'high' },
                { regex: /writeFileSync\(/, issue: 'Bloqueio: writeFileSync em Bun — use Bun.write() PhD.', severity: 'high' },
                { regex: /fs\.readFile\(/, issue: 'Polyfill: fs.readFile em Bun — use Bun.file() nativo PhD.', severity: 'medium' },
                { regex: /fs\.writeFile\(/, issue: 'Polyfill: fs.writeFile em Bun — use Bun.write() nativo PhD.', severity: 'medium' },
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
        if (typeof content === 'string' && /readFileSync|writeFileSync/.test(content)) {
            return {
                file, severity: "HIGH",
                issue: `Lentidão: O objetivo '${objective}' exige I/O nativo Bun. Em '${file}', sync I/O desperdiça o potencial do Bun runtime PhD.`,
                context: "Sync I/O detected"
            };
        }
        return {
            file, severity: "INFO",
            issue: `PhD Cache (Bun): Maximizando performance I/O nativa para ${objective}.`,
            context: this.name
        };
    }

    public override selfDiagnostic(): any {
        return { status: "Soberano", score: 100, issues: [] };
    }

    public override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, mestre em I/O nativo e caching Bun.`;
    }
}
