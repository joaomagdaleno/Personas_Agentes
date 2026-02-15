import { BaseActivePersona } from "../../base_persona.ts";
import winston from "winston";

const logger = winston.child({ module: "Bun_Scope" });

/**
 * 🎯 Dr. Scope — PhD in Bun Project Debt & Configuration Management
 * Especialista em dívida técnica, bunfig.toml e gestão de dependências Bun.
 */
export class ScopePersona extends BaseActivePersona {
    constructor(projectRoot: string | null = null) {
        super(projectRoot);
        this.name = "Scope";
        this.emoji = "🎯";
        this.role = "PhD Bun Project Strategist";
        this.stack = "Bun";
    }

    async performAudit(): Promise<any[]> {
        const start = Date.now();
        logger.info(`[${this.name}] Analisando Gestão de Escopo Bun...`);

        const auditRules = [
            { regex: '\\/\\/\\s*TODO[:\\s]', issue: 'Dívida: TODO pendente no código Bun.', severity: 'medium' },
            { regex: '\\/\\/\\s*FIXME[:\\s]', issue: 'Dívida Crítica: FIXME no código Bun.', severity: 'high' },
            { regex: '\\/\\/\\s*HACK[:\\s]', issue: 'Gambiarra: HACK no código Bun.', severity: 'high' },
            { regex: 'bun add.*--dev.*(?:express|koa|fastify)', issue: 'Conflito: Framework HTTP Node.js em projeto Bun — use Bun.serve().', severity: 'high' },
            { regex: '"node-fetch"|\'node-fetch\'', issue: 'Redundante: node-fetch em Bun — fetch() é nativo.', severity: 'medium' },
        ];

        const results: any[] = [];
        for (const rule of auditRules) {
            const regex = new RegExp(rule.regex, 'gi');
            for (const [filePath, content] of Object.entries(this.contextData)) {
                if (filePath.endsWith('.ts') || filePath.endsWith('.tsx') || filePath.endsWith('.toml') || filePath.endsWith('.json')) {
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
        const debtCount = (content.match(/\/\/\s*(TODO|FIXME|HACK)/gi) || []).length;
        if (debtCount > 3) {
            return {
                file, severity: "HIGH", persona: this.name,
                issue: `Erosão de Escopo: O objetivo '${objective}' exige completude. O arquivo '${file}' contém ${debtCount} marcadores de dívida técnica Bun.`
            };
        }
        return null;
    }

    getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, mestre em gestão de escopo e dívida técnica Bun.`;
    }
}
