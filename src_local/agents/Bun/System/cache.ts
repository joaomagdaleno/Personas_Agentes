import { BaseActivePersona } from "../../base_persona.ts";
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

    async performAudit(): Promise<any[]> {
        const start = Date.now();
        logger.info(`[${this.name}] Analisando I/O Bun...`);

        const auditRules = [
            { regex: 'readFileSync\\(', issue: 'Bloqueio: readFileSync em Bun — use Bun.file().text().', severity: 'high' },
            { regex: 'writeFileSync\\(', issue: 'Bloqueio: writeFileSync em Bun — use Bun.write().', severity: 'high' },
            { regex: 'fs\\.readFile\\(', issue: 'Polyfill: fs.readFile em Bun — use Bun.file() nativo.', severity: 'medium' },
            { regex: 'fs\\.writeFile\\(', issue: 'Polyfill: fs.writeFile em Bun — use Bun.write() nativo.', severity: 'medium' },
        ];

        const results: any[] = [];
        for (const rule of auditRules) {
            const regex = new RegExp(rule.regex, 'g');
            for (const [filePath, content] of Object.entries(this.contextData)) {
                if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
                    for (const match of (content as string).matchAll(regex)) {
                        results.push({ file: filePath, issue: rule.issue, severity: rule.severity, evidence: match[0], persona: this.name });
                    }
                }
            }
        }

        const duration = (Date.now() - start) / 1000;
        logger.info(`[${this.name}] Auditoria concluída em ${duration.toFixed(4)}s. Achados: ${results.length}`);
        return results;
    }

    async reasonAboutObjective(objective: string, file: string, content: string): Promise<any | null> {
        if (/readFileSync|writeFileSync/.test(content)) {
            return {
                file, severity: "HIGH", persona: this.name,
                issue: `Lentidão: O objetivo '${objective}' exige I/O nativo Bun. Em '${file}', sync I/O desperdiça o potencial do Bun runtime.`
            };
        }
        return null;
    }

    getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, mestre em I/O nativo e caching Bun.`;
    }
}
