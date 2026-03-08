import { BaseActivePersona, AuditRule, StrategicFinding } from "../../base.ts";
import winston from "winston";

const logger = winston.child({ module: "Bun_Cache" });

/**
 * 💾 Dr. Cache — PhD in Bun I/O Optimization & Bun.file
 * Especialista em otimização de I/O com Bun.file, Bun.write e caching.
 */
export class CachePersona extends BaseActivePersona {
    constructor(projectRoot: string | null = null) {
        super(projectRoot);
        this.name = "Cache";
        this.emoji = "💾";
        this.role = "PhD Bun Data Layer Engineer";
        this.stack = "Bun";
    }

    getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: ['.ts', '.tsx'],
            rules: [
                { regex: /readFileSync\(/, issue: 'Bloqueio: readFileSync em Bun — use Bun.file().text().', severity: 'high' },
                { regex: /writeFileSync\(/, issue: 'Bloqueio: writeFileSync em Bun — use Bun.write().', severity: 'high' },
                { regex: /fs\.readFile\(/, issue: 'Polyfill: fs.readFile em Bun — use Bun.file() nativo.', severity: 'medium' },
                { regex: /fs\.writeFile\(/, issue: 'Polyfill: fs.writeFile em Bun — use Bun.write() nativo.', severity: 'medium' },
            ]
        };
    }

    reasonAboutObjective(objective: string, file: string, content: string | Promise<string | null>): StrategicFinding | string | null {
        if (typeof content !== 'string') return null;
        if (/readFileSync|writeFileSync/.test(content)) {
            return {
                file, severity: "HIGH",
                issue: `Lentidão: O objetivo '${objective}' exige I/O nativo Bun. Em '${file}', sync I/O desperdiça o potencial do Bun runtime.`,
                context: "Sync I/O detected"
            };
        }
        return null;
    }

    getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, mestre em I/O nativo e caching Bun.`;
    }
}
