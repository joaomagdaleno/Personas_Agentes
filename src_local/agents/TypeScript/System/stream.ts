import { BaseActivePersona, AuditRule, StrategicFinding } from "../../base.ts";
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

    getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: ['.ts', '.tsx'],
            rules: [
                { regex: /addEventListener\([^)]*\)(?![\s\S]{0,200}removeEventListener)/, issue: 'Memory Leak: addEventListener sem removeEventListener correspondente.', severity: 'high' },
                { regex: /\.on\([^)]*\)(?![\s\S]{0,200}\.off\(|\.removeListener)/, issue: 'Vazamento: .on() sem .off() — event handler nunca removido.', severity: 'high' },
                { regex: /setInterval\([^)]*\)(?![\s\S]{0,200}clearInterval)/, issue: 'Timer Leak: setInterval sem clearInterval — acumula execuções.', severity: 'high' },
                { regex: /new\s+EventEmitter\(\)(?![\s\S]{0,200}setMaxListeners)/, issue: 'Risco de Overflow: EventEmitter sem limite de listeners.', severity: 'medium' },
                { regex: /process\.on\(["']uncaughtException/, issue: 'Controle Global: uncaughtException handler — garanta re-throw ou exit.', severity: 'medium' },
            ]
        };
    }

    reasonAboutObjective(objective: string, file: string, content: string | Promise<string | null>): StrategicFinding | string | null {
        if (typeof content !== 'string') return null;
        if (/addEventListener/.test(content) && !/removeEventListener/.test(content)) {
            return {
                file, severity: "HIGH",
                issue: `Instabilidade Reativa: O objetivo '${objective}' exige resiliência. Em '${file}', event listeners sem cleanup causam memory leaks na 'Orquestração de Inteligência Artificial'.`,
                context: "addEventListener without cleanup detected"
            };
        }
        return {
            file, severity: "INFO",
            issue: `PhD Stream: Analisando arquitetura reativa para ${objective}. Focando em lifecycle de eventos e memory leaks.`,
            context: "analyzing reactive architecture"
        };
    }

    selfDiagnostic(): any {
        return {
            status: "Soberano",
            score: 100,
            details: "Engenheiro de fluxo TS operando com reatividade PhD."
        };
    }

    getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, mestre em sistemas reativos e gestão de eventos TypeScript.`;
    }
}
