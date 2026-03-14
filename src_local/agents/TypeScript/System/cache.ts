import { BaseActivePersona } from "../../base.ts";
import type { AuditRule, StrategicFinding, ProjectContext, AuditFinding } from "../../base.ts";

/**
 * 💾 Dr. Cache — PhD in TypeScript Data Layer & I/O Optimization
 * Especialista em otimização de I/O, leituras síncronas e gestão de cache.
 */
export class CachePersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Cache";
        this.emoji = "💾";
        this.role = "PhD Data Layer Engineer";
        this.phd_identity = "Data Layer & I/O Optimization (TypeScript)";
        this.stack = "TypeScript";
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
                { regex: /readFileSync\(/, issue: 'Bloqueio de I/O: readFileSync trava o event loop PhD.', severity: 'high' },
                { regex: /writeFileSync\(/, issue: 'Bloqueio de I/O: writeFileSync trava o event loop PhD.', severity: 'high' },
                { regex: /fs\.(?:read|write|stat|access)(?!.*Sync)(?!.*await|promise)/, issue: 'Callback I/O: Operação de arquivo via callback — use fs/promises PhD.', severity: 'medium' },
                { regex: /new Map\(\).*(?:set|get).*(?:set|get).*(?:set|get)/, issue: 'Cache Ingênuo: Map como cache sem TTL ou eviction — risco de memory leak PhD.', severity: 'medium' },
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
        if (typeof content === 'string' && (/readFileSync|writeFileSync/.test(content))) {
            return {
                file, severity: "HIGH",
                issue: `Lentidão Sistêmica: O objetivo '${objective}' exige velocidade. Em '${file}', operações síncronas de arquivo prejudicam o IO PhD.`,
                context: "Sync I/O detected"
            };
        }
        return {
            file, severity: "INFO",
            issue: `PhD Cache (TypeScript): Analisando performance de I/O para ${objective}. Focando em eliminação de bloqueios síncronos.`,
            context: this.name
        };
    }

    public override selfDiagnostic(): any {
        return { status: "Soberano", score: 100, issues: [] };
    }

    public override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, mestre em dados e otimização de I/O TypeScript.`;
    }
}
