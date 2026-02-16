import { BaseActivePersona } from "../../base_persona.ts";
import winston from "winston";

const logger = winston.child({ module: "TS_Nexus" });

/**
 * 🌐 Dr. Nexus — PhD in TypeScript Networking & HTTP Resilience
 * Especialista em timeout, retries, abort controllers e fetch resiliente.
 */
export class NexusPersona extends BaseActivePersona {
    constructor(projectRoot: string | null = null) {
        super(projectRoot);
        this.name = "Nexus";
        this.emoji = "🌐";
        this.role = "PhD Network Resilience Engineer";
        this.stack = "TypeScript";
    }

    async performAudit(): Promise<any[]> {
        const start = Date.now();
        logger.info(`[${this.name}] Analisando Resiliência de Rede TypeScript...`);

        const auditRules = [
            { regex: 'fetch\\s*\\([^)]*\\)(?![\\s\\S]{0,100}signal|timeout|AbortController)', issue: 'Fragilidade: fetch() sem timeout ou AbortController — pendurado para sempre.', severity: 'high' },
            { regex: 'axios\\.(?:get|post)\\([^)]*\\)(?![\\s\\S]{0,50}timeout)', issue: 'Fragilidade: Chamada axios sem timeout configurado.', severity: 'high' },
            { regex: 'setTimeout\\s*\\([^)]*,\\s*0\\s*\\)', issue: 'Hack: setTimeout(fn, 0) — geralmente indica problema de design.', severity: 'low' },
            { regex: 'WebSocket\\s*\\([^)]*\\)(?![\\s\\S]{0,100}onclose|onerror)', issue: 'Conexão Frágil: WebSocket sem handler de erro ou desconexão.', severity: 'high' },
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
        if (/fetch\s*\(/.test(content) && !/AbortController|signal|timeout/.test(content)) {
            return {
                file, severity: "HIGH", persona: this.name,
                issue: `Fragilidade Nervosa: O objetivo '${objective}' exige resiliência. Em '${file}', chamadas HTTP sem timeout ameaçam a 'Orquestração de Inteligência Artificial'.`
            };
        }
        return {
            file, severity: "INFO", persona: this.name,
            issue: `PhD Nexus: Analisando resiliência de rede para ${objective}. Focando em timeouts e circuit breakers.`
        };
    }

    selfDiagnostic(): any {
        return {
            status: "Soberano",
            score: 100,
            details: "Engenheiro de rede TS operando com resiliência PhD."
        };
    }

    getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, mestre em redes e resiliência HTTP TypeScript.`;
    }
}
