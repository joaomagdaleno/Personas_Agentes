import { BaseActivePersona, AuditRule, StrategicFinding } from "../../base.ts";
import winston from "winston";

const logger = winston.child({ module: "Bun_Echo" });

/**
 * 📡 Dr. Echo — PhD in Bun Diagnostic Tracing & Runtime Signals
 * Especialista em rastreamento de execução Bun, debugger statements e process signals.
 */
export class EchoPersona extends BaseActivePersona {
    constructor(projectRoot: string | null = null) {
        super(projectRoot);
        this.name = "Echo";
        this.emoji = "📡";
        this.role = "PhD Bun Diagnostic Tracer";
        this.stack = "Bun";
    }

    getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: ['.ts', '.tsx'],
            rules: [
                { regex: /console\.log\(/, issue: 'Cegueira: console.log sem logger estruturado Bun.', severity: 'high' },
                { regex: /debugger;/, issue: 'Breakpoint Esquecido: debugger statement em código Bun.', severity: 'critical' },
                { regex: /Bun\.inspect\(/, issue: 'Debug: Bun.inspect() em produção — remover antes de deploy.', severity: 'medium' },
                { regex: /process\.on\(["']SIGTERM/, issue: 'Signal Handling: Verifique graceful shutdown em Bun.serve.', severity: 'low' },
            ]
        };
    }

    reasonAboutObjective(objective: string, file: string, content: string | Promise<string | null>): StrategicFinding | string | null {
        if (typeof content !== 'string') return null;
        if (/debugger;/.test(content)) {
            return {
                file, severity: "CRITICAL",
                issue: `Artefato de Debug: O objetivo '${objective}' exige produção limpa. Em '${file}', debugger statement pausa a execução da 'Orquestração de Inteligência Artificial' Bun.`,
                context: "debugger statement detected"
            };
        }
        return null;
    }

    getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, mestre em rastreabilidade e sinais de runtime Bun.`;
    }
}
