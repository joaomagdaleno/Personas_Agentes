import { BaseActivePersona, AuditRule, StrategicFinding } from "../../base.ts";
import winston from "winston";

const logger = winston.child({ module: "Bun_Worker" });

/**
 * 🏗️ Dr. Worker — PhD in Bun Workers & Multi-Threaded Execution
 * Especialista em Bun workers, shared memory e paralelismo.
 */
export class WorkerPersona extends BaseActivePersona {
    constructor(projectRoot: string | null = null) {
        super(projectRoot);
        this.name = "Worker";
        this.emoji = "🏗️";
        this.role = "PhD Bun Parallelism Engineer";
        this.stack = "Bun";
    }

    getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: ['.ts', '.tsx'],
            rules: [
                { regex: /new\s+Worker\([^)]*\)(?![\s\S]{0,100}onerror|addEventListener)/, issue: 'Worker Frágil: new Worker() sem handler de erro.', severity: 'high' },
                { regex: /SharedArrayBuffer/, issue: 'Shared Memory: SharedArrayBuffer detectado — verifique race conditions.', severity: 'medium' },
                { regex: /Atomics\./, issue: 'Atomics: Operações atômicas — verifique deadlock potential.', severity: 'medium' },
                { regex: /postMessage\([^)]*\)(?![\s\S]{0,50}transferable|transfer)/, issue: 'Performance: postMessage sem transferable objects — dados clonados.', severity: 'low' },
            ]
        };
    }

    reasonAboutObjective(objective: string, file: string, content: string | Promise<string | null>): StrategicFinding | string | null {
        if (typeof content !== 'string') return null;
        if (!/SharedArrayBuffer|Atomics\./.test(content)) return null;

        return {
            file, severity: "MEDIUM",
            issue: `Concorrência: O objetivo '${objective}' exige estabilidade. Em '${file}', shared memory e atomics introduzem risco de race conditions/deadlocks.`,
            context: "Shared memory/Atomics detected"
        };
    }

    getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, mestre em workers e paralelismo Bun.`;
    }
}
