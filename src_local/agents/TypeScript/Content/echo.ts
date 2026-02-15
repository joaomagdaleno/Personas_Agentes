import { BaseActivePersona } from "../../base_persona.ts";
import winston from "winston";

const logger = winston.child({ module: "TS_Echo" });

/**
 * 📡 Dr. Echo — PhD in TypeScript Logging & Diagnostic Tracing
 * Especialista em rastreabilidade, logging estruturado e observabilidade de runtime.
 */
export class EchoPersona extends BaseActivePersona {
    constructor(projectRoot: string | null = null) {
        super(projectRoot);
        this.name = "Echo";
        this.emoji = "📡";
        this.role = "PhD Diagnostic Tracer";
        this.stack = "TypeScript";
    }

    async performAudit(): Promise<any[]> {
        const start = Date.now();
        logger.info(`[${this.name}] Analisando Rastreabilidade TypeScript...`);

        const auditRules = [
            { regex: 'console\\.log\\(', issue: 'Cegueira Operacional: console.log sem logger estruturado.', severity: 'high' },
            { regex: 'console\\.debug\\(', issue: 'Debug em Produção: console.debug vazando para runtime.', severity: 'medium' },
            { regex: 'console\\.trace\\(', issue: 'Vazamento de Stack: console.trace expondo internos.', severity: 'medium' },
            { regex: 'alert\\(', issue: 'Primitivo: alert() bloqueia thread e UX.', severity: 'high' },
            { regex: 'debugger;', issue: 'Breakpoint Esquecido: debugger statement em produção.', severity: 'critical' },
        ];

        const results: any[] = [];
        for (const rule of auditRules) {
            const regex = new RegExp(rule.regex, 'g');
            for (const [filePath, content] of Object.entries(this.contextData)) {
                if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
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
        if (/console\.(log|error|warn)\(/.test(content) && !/logger/.test(content)) {
            return {
                file, severity: "HIGH", persona: this.name,
                issue: `Cegueira Operacional: O objetivo '${objective}' exige diagnóstico. Em '${file}', o uso de console.* impede a rastreabilidade da 'Orquestração de Inteligência Artificial'.`
            };
        }
        return null;
    }

    getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, mestre em telemetria e rastro digital TypeScript.`;
    }
}
