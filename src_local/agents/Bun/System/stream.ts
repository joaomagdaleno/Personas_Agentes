import { BaseActivePersona } from "../../base_persona.ts";
import winston from "winston";

const logger = winston.child({ module: "Bun_Stream" });

/**
 * 🌊 Dr. Stream — PhD in Bun Reactive Systems & Event Management
 * Especialista em event listeners Bun, memory leaks e gestão reativa.
 */
export class StreamPersona extends BaseActivePersona {
    constructor(projectRoot: string | null = null) {
        super(projectRoot);
        this.name = "Stream";
        this.emoji = "🌊";
        this.role = "PhD Bun Reactive Systems Engineer";
        this.stack = "Bun";
    }

    async performAudit(): Promise<any[]> {
        const start = Date.now();
        logger.info(`[${this.name}] Analisando Reatividade Bun...`);

        const auditRules = this.getStreamRules();
        const results: any[] = [];

        for (const rule of auditRules) {
            this.auditWithRule(rule, results);
        }

        const duration = (Date.now() - start) / 1000;
        logger.info(`[${this.name}] Auditoria concluída em ${duration.toFixed(4)}s. Achados: ${results.length}`);
        return results;
    }

    private getStreamRules() {
        return [
            { regex: 'addEventListener\\([^)]*\\)(?![\\s\\S]{0,200}removeEventListener)', issue: 'Leak: addEventListener sem removeEventListener no Bun.', severity: 'high' },
            { regex: '\\.on\\([^)]*\\)(?![\\s\\S]{0,200}\\.off\\()', issue: 'Leak: .on() sem .off() no Bun.', severity: 'high' },
            { regex: 'setInterval\\([^)]*\\)(?![\\s\\S]{0,200}clearInterval)', issue: 'Timer Leak: setInterval sem clearInterval no Bun.', severity: 'high' },
            { regex: 'Bun\\.serve\\([^)]*\\)(?![\\s\\S]{0,200}\\.stop\\()', issue: 'Servidor Immortal: Bun.serve sem .stop() — sem graceful shutdown.', severity: 'medium' },
        ];
    }

    private auditWithRule(rule: any, results: any[]) {
        const regex = new RegExp(rule.regex, 'gs');
        for (const [filePath, content] of Object.entries(this.contextData)) {
            if (this.shouldAuditFile(filePath)) {
                this.scanContent(filePath, content as string, regex, rule, results);
            }
        }
    }

    private shouldAuditFile(filePath: string): boolean {
        return filePath.endsWith('.ts') || filePath.endsWith('.tsx');
    }

    private scanContent(filePath: string, content: string, regex: RegExp, rule: any, results: any[]) {
        for (const match of content.matchAll(regex)) {
            results.push({
                file: filePath,
                issue: rule.issue,
                severity: rule.severity,
                evidence: match[0].substring(0, 80),
                persona: this.name
            });
        }
    }

    async reasonAboutObjective(objective: string, file: string, content: string): Promise<any | null> {
        if (/addEventListener/.test(content) && !/removeEventListener/.test(content)) {
            return {
                file, severity: "HIGH", persona: this.name,
                issue: `Memory Leak: O objetivo '${objective}' exige estabilidade. Em '${file}', event listeners sem cleanup causam leaks no Bun.`
            };
        }
        return null;
    }

    getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, mestre em sistemas reativos e gestão de eventos Bun.`;
    }
}
