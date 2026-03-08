import { BaseActivePersona } from "../../base_persona.ts";
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

    async performAudit(): Promise<any[]> {
        this.startMetrics();
        logger.info(`[${this.name}] Analisando Paralelismo Bun...`);

        const auditRules = [
            { regex: 'new\\s+Worker\\([^)]*\\)(?![\\s\\S]{0,100}onerror|addEventListener)', issue: 'Worker Frágil: new Worker() sem handler de erro.', severity: 'high' },
            { regex: 'SharedArrayBuffer', issue: 'Shared Memory: SharedArrayBuffer detectado — verifique race conditions.', severity: 'medium' },
            { regex: 'Atomics\\.', issue: 'Atomics: Operações atômicas — verifique deadlock potential.', severity: 'medium' },
            { regex: 'postMessage\\([^)]*\\)(?![\\s\\S]{0,50}transferable|transfer)', issue: 'Performance: postMessage sem transferable objects — dados clonados.', severity: 'low' },
        ];

        const results = await this.findPatterns(['.ts', '.tsx'], auditRules as any);
        this.endMetrics(results.length);
        return results;
    }

    async reasonAboutObjective(objective: string, file: string, content: string): Promise<any | null> {
        if (!/SharedArrayBuffer|Atomics\./.test(content)) return null;

        return {
            file, severity: "MEDIUM", persona: this.name,
            issue: `Concorrência: O objetivo '${objective}' exige estabilidade. Em '${file}', shared memory e atomics introduzem risco de race conditions/deadlocks.`
        };
    }

    getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, mestre em workers e paralelismo Bun.`;
    }
}

