import { BaseActivePersona } from "../../base.ts";
import type { AuditFinding, AuditRule, StrategicFinding, ProjectContext } from "../../base.ts";
import winston from "winston";

const logger = winston.child({ module: "Bun_Worker" });

/**
 * 🏗️ Dr. Worker — PhD in Bun Workers & Multi-Threaded Execution
 * Especialista em Bun workers, shared memory e paralelismo.
 */
export class WorkerPersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Worker";
        this.emoji = "🏗️";
        this.role = "PhD Bun Parallelism Engineer";
        this.phd_identity = "Multi-Threaded Execution & Shared Memory (Bun)";
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
                { regex: /new\s+Worker\([^)]*\)(?![\s\S]{0,100}onerror|addEventListener)/, issue: 'Worker Frágil: new Worker() sem handler de erro PhD.', severity: 'high' },
                { regex: /SharedArrayBuffer/, issue: 'Shared Memory: SharedArrayBuffer detectado — verifique race conditions PhD.', severity: 'medium' },
                { regex: /Atomics\./, issue: 'Atomics: Operações atômicas — verifique deadlock potential PhD.', severity: 'medium' },
                { regex: /postMessage\([^)]*\)(?![\s\S]{0,50}transferable|transfer)/, issue: 'Performance: postMessage sem transferable objects — dados clonados PhD.', severity: 'low' },
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
        if (typeof content === 'string' && /SharedArrayBuffer|Atomics\./.test(content)) {
            return {
                file, severity: "MEDIUM",
                issue: `Concorrência: O objetivo '${objective}' exige estabilidade. Em '${file}', shared memory e atomics introduzem risco de race conditions PhD.`,
                context: "Shared memory/Atomics detected"
            };
        }
        return {
            file, severity: "INFO",
            issue: `PhD Worker (Bun): Analisando concorrência e execução de workers para ${objective}.`,
            context: this.name
        };
    }

    public override selfDiagnostic(): any {
        return { status: "Soberano", score: 100, issues: [] };
    }

    public override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, mestre em workers e paralelismo Bun.`;
    }
}
