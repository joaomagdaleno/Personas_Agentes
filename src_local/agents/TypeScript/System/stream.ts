import { BaseActivePersona } from "../../base_persona.ts";
import winston from "winston";

const logger = winston.child({ module: "TS_Stream" });

/**
 * 🌊 Dr. Stream — PhD in TypeScript Reactive Programming & Event Management
 * Especialista em event listeners, memory leaks de eventos e gestão reativa.
 */
export class StreamPersona extends BaseActivePersona {
    constructor(projectRoot: string | null = null) {
        super(projectRoot);
        this.name = "Stream";
        this.emoji = "🌊";
        this.role = "PhD Reactive Systems Engineer";
        this.stack = "TypeScript";
    }

    async performAudit(): Promise<any[]> {
        const start = Date.now();
        logger.info(`[${this.name}] Analisando Reatividade TypeScript...`);

        const auditRules = [
            { regex: 'addEventListener\\([^)]*\\)(?![\\s\\S]{0,200}removeEventListener)', issue: 'Memory Leak: addEventListener sem removeEventListener correspondente.', severity: 'high' },
            { regex: '\\.on\\([^)]*\\)(?![\\s\\S]{0,200}\\.off\\(|\\.removeListener)', issue: 'Vazamento: .on() sem .off() — event handler nunca removido.', severity: 'high' },
            { regex: 'setInterval\\([^)]*\\)(?![\\s\\S]{0,200}clearInterval)', issue: 'Timer Leak: setInterval sem clearInterval — acumula execuções.', severity: 'high' },
            { regex: 'new\\s+EventEmitter\\(\\)(?![\\s\\S]{0,200}setMaxListeners)', issue: 'Risco de Overflow: EventEmitter sem limite de listeners.', severity: 'medium' },
            { regex: 'process\\.on\\(["\']uncaughtException', issue: 'Controle Global: uncaughtException handler — garanta re-throw ou exit.', severity: 'medium' },
        ];

        const results: any[] = [];
        for (const rule of auditRules) {
            const regex = new RegExp(rule.regex, 'gs');
            for (const [filePath, content] of Object.entries(this.contextData)) {
                if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
                    for (const match of (content as string).matchAll(regex)) {
                        results.push({ file: filePath, issue: rule.issue, severity: rule.severity, evidence: match[0].substring(0, 80), persona: this.name });
                    }
                }
            }
        }

        const duration = (Date.now() - start) / 1000;
        logger.info(`[${this.name}] Auditoria concluída em ${duration.toFixed(4)}s. Achados: ${results.length}`);
        return results;
    }

    async reasonAboutObjective(objective: string, file: string, content: string): Promise<any | null> {
        if (/addEventListener/.test(content) && !/removeEventListener/.test(content)) {
            return {
                file, severity: "HIGH", persona: this.name,
                issue: `Instabilidade Reativa: O objetivo '${objective}' exige resiliência. Em '${file}', event listeners sem cleanup causam memory leaks na 'Orquestração de Inteligência Artificial'.`
            };
        }
        return null;
    }

    getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, mestre em sistemas reativos e gestão de eventos TypeScript.`;
    }
}
