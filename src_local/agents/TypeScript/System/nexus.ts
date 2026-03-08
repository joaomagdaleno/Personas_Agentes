import { BaseActivePersona, AuditRule, StrategicFinding } from "../../base.ts";
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

    getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: ['.ts', '.tsx'],
            rules: [
                { regex: /fetch\s*\([^)]*\)(?![\s\S]{0,100}signal|timeout|AbortController)/, issue: 'Fragilidade: fetch() sem timeout ou AbortController — pendurado para sempre.', severity: 'high' },
                { regex: /axios\.(?:get|post)\([^)]*\)(?![\s\S]{0,50}timeout)/, issue: 'Fragilidade: Chamada axios sem timeout configurado.', severity: 'high' },
                { regex: /setTimeout\s*\([^)]*,\s*0\s*\)/, issue: 'Hack: setTimeout(fn, 0) — geralmente indica problema de design.', severity: 'low' },
                { regex: /WebSocket\s*\([^)]*\)(?![\s\S]{0,100}onclose|onerror)/, issue: 'Conexão Frágil: WebSocket sem handler de erro ou desconexão.', severity: 'high' },
            ]
        };
    }

    reasonAboutObjective(objective: string, file: string, content: string | Promise<string | null>): StrategicFinding | string | null {
        if (typeof content !== 'string') return null;
        if (/fetch\s*\(/.test(content) && !/AbortController|signal|timeout/.test(content)) {
            return {
                file, severity: "HIGH",
                issue: `Fragilidade Nervosa: O objetivo '${objective}' exige resiliência. Em '${file}', chamadas HTTP sem timeout ameaçam a 'Orquestração de Inteligência Artificial'.`,
                context: "fetch without timeout detected"
            };
        }
        return {
            file, severity: "INFO",
            issue: `PhD Nexus: Analisando resiliência de rede para ${objective}. Focando em timeouts e circuit breakers.`,
            context: "analyzing network resilience"
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
