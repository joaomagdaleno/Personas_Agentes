import { BaseActivePersona } from "../../base_persona.ts";
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

    async performAudit(): Promise<any[]> {
        const start = Date.now();
        logger.info(`[${this.name}] Analisando Resiliência de Rede Bun...`);

        const auditRules = [
            { regex: 'fetch\\s*\\([^)]*\\)(?![\\s\\S]{0,100}signal|AbortController)', issue: 'Fragilidade: fetch() sem timeout/AbortController no Bun.', severity: 'high' },
            { regex: 'Bun\\.serve\\([^)]*websocket[^)]*\\)(?![\\s\\S]{0,200}close|error)', issue: 'WebSocket Frágil: Bun.serve WebSocket sem handler close/error.', severity: 'high' },
            { regex: 'new\\s+WebSocket\\([^)]*\\)(?![\\s\\S]{0,200}onerror)', issue: 'Conexão Frágil: WebSocket sem handler de erro no Bun.', severity: 'high' },
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
        if (/fetch\s*\(/.test(content) && !/AbortController|signal/.test(content)) {
            return {
                file, severity: "HIGH", persona: this.name,
                issue: `Fragilidade: O objetivo '${objective}' exige resiliência. Em '${file}', fetch sem timeout ameaça o Bun.serve.`
            };
        }
        return null;
    }

    getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, mestre em redes e resiliência HTTP Bun.`;
    }
}
