import { BaseActivePersona, AuditRule, StrategicFinding } from "../../base.ts";
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

    getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: ['.ts', '.tsx'],
            rules: [
                { regex: /addEventListener\([^)]*\)(?![\s\S]{0,200}removeEventListener)/, issue: 'Leak: addEventListener sem removeEventListener no Bun.', severity: 'high' },
                { regex: /\.on\([^)]*\)(?![\s\S]{0,200}\.off\()/, issue: 'Leak: .on() sem .off() no Bun.', severity: 'high' },
                { regex: /setInterval\([^)]*\)(?![\s\S]{0,200}clearInterval)/, issue: 'Timer Leak: setInterval sem clearInterval no Bun.', severity: 'high' },
                { regex: /Bun\.serve\([^)]*\)(?![\s\S]{0,200}\.stop\()/, issue: 'Servidor Immortal: Bun.serve sem .stop() — sem graceful shutdown.', severity: 'medium' },
            ]
        };
    }

    reasonAboutObjective(objective: string, file: string, content: string | Promise<string | null>): StrategicFinding | string | null {
        if (typeof content !== 'string') return null;
        if (/addEventListener/.test(content) && !/removeEventListener/.test(content)) {
            return {
                file, severity: "HIGH",
                issue: `Memory Leak: O objetivo '${objective}' exige estabilidade. Em '${file}', event listeners sem cleanup causam leaks no Bun.`,
                context: "addEventListener without cleanup detected"
            };
        }
        return null;
    }

    getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, mestre em sistemas reativos e gestão de eventos Bun.`;
    }
}
