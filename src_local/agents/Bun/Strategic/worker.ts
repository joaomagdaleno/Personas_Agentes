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
        const start = Date.now();
        logger.info(`[${this.name}] Analisando Paralelismo Bun...`);

        const auditRules = [
            { regex: 'new\\s+Worker\\([^)]*\\)(?![\\s\\S]{0,100}onerror|addEventListener)', issue: 'Worker Frágil: new Worker() sem handler de erro.', severity: 'high' },
            { regex: 'SharedArrayBuffer', issue: 'Shared Memory: SharedArrayBuffer detectado — verifique race conditions.', severity: 'medium' },
            { regex: 'Atomics\\.', issue: 'Atomics: Operações atômicas — verifique deadlock potential.', severity: 'medium' },
            { regex: 'postMessage\\([^)]*\\)(?![\\s\\S]{0,50}transferable|transfer)', issue: 'Performance: postMessage sem transferable objects — dados clonados.', severity: 'low' },
        ];

        const results: any[] = [];
        for (const rule of auditRules) {
            const regex = new RegExp(rule.regex, 'gs');
            for (const [filePath, content] of Object.entries(this.contextData)) {
                if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
                    for (const match of (content as string).matchAll(regex)) {
                        results.push({ file: filePath, issue: rule.issue, severity: rule.severity, evidence: match[0].substring(0, 60), persona: this.name });
                    }
                }
            }
        }

        const duration = (Date.now() - start) / 1000;
        logger.info(`[${this.name}] Auditoria concluída em ${duration.toFixed(4)}s. Achados: ${results.length}`);
        return results;
    }

    async reasonAboutObjective(objective: string, file: string, content: string): Promise<any | null> {
        if (/SharedArrayBuffer|Atomics\./.test(content)) {
            return {
                file, severity: "MEDIUM", persona: this.name,
                issue: `Concorrência: O objetivo '${objective}' exige estabilidade. Em '${file}', shared memory e atomics introduzem risco de race conditions/deadlocks.`
            };
        }
        return null;
    }

    getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, mestre em workers e paralelismo Bun.`;
    }
}
