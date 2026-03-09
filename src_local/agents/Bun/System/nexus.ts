import { BaseActivePersona, AuditRule, StrategicFinding } from "../../base.ts";
import winston from "winston";

const logger = winston.child({ module: "Bun_Nexus" });

/**
 * 🌐 Dr. Nexus — PhD in Bun Networking & Bun.serve Resilience
 * Especialista em Bun.serve, WebSockets nativos e resiliência HTTP Bun.
 */
export class NexusPersona extends BaseActivePersona {
    constructor(projectRoot: string | null = null) {
        super(projectRoot);
        this.name = "Nexus";
        this.emoji = "🌐";
        this.role = "PhD Bun Network Resilience Engineer";
        this.stack = "Bun";
    }

    getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: ['.ts', '.tsx'],
            rules: [
                { regex: /fetch\s*\([^)]*\)(?![\s\S]{0,100}signal|AbortController)/, issue: 'Fragilidade: fetch() sem timeout/AbortController no Bun.', severity: 'high' },
                { regex: /Bun\.serve\([^)]*websocket[^)]*\)(?![\s\S]{0,200}close|error)/, issue: 'WebSocket Frágil: Bun.serve WebSocket sem handler close/error.', severity: 'high' },
                { regex: /new\s+WebSocket\([^)]*\)(?![\s\S]{0,200}onerror)/, issue: 'Conexão Frágil: WebSocket sem handler de erro no Bun.', severity: 'high' },
            ]
        };
    }

    reasonAboutObjective(objective: string, file: string, content: string | Promise<string | null>): StrategicFinding | string | null {
        if (typeof content !== 'string') return null;
        if (/fetch\s*\(/.test(content) && !/AbortController|signal/.test(content)) {
            return {
                file, severity: "HIGH",
                issue: `Fragilidade: O objetivo '${objective}' exige resiliência. Em '${file}', fetch sem timeout ameaça o Bun.serve.`,
                context: "fetch without timeout detected"
            };
        }
        return null;
    }

    getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, mestre em redes e resiliência HTTP Bun.`;
    }
}
