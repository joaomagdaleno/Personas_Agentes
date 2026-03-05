import { BaseActivePersona } from "../../base_persona.ts";
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

    async performAudit(): Promise<any[]> {
        const start = Date.now();
        logger.info(`[${this.name}] Analisando Rastreabilidade Bun...`);

        const rules = [
            { regex: 'console\\.log\\(', issue: 'Cegueira: console.log sem logger estruturado Bun.', severity: 'high' },
            { regex: 'debugger;', issue: 'Breakpoint Esquecido: debugger statement em código Bun.', severity: 'critical' },
            { regex: 'Bun\\.inspect\\(', issue: 'Debug: Bun.inspect() em produção — remover antes de deploy.', severity: 'medium' },
            { regex: 'process\\.on\\(["\']SIGTERM', issue: 'Signal Handling: Verifique graceful shutdown em Bun.serve.', severity: 'low' },
        ];

        const results = rules.flatMap(rule => this.auditRule(rule));

        const duration = (Date.now() - start) / 1000;
        logger.info(`[${this.name}] Auditoria concluída em ${duration.toFixed(4)}s. Achados: ${results.length}`);
        return results;
    }

    private auditRule(rule: any): any[] {
        const regex = new RegExp(rule.regex, 'g');
        return Object.entries(this.contextData)
            .filter(([path]) => path.endsWith('.ts') || path.endsWith('.tsx'))
            .flatMap(([path, content]) => this.findMatches(path, content as string, regex, rule));
    }

    private findMatches(path: string, content: string, regex: RegExp, rule: any): any[] {
        return Array.from(content.matchAll(regex)).map(match => ({
            file: path,
            issue: rule.issue,
            severity: rule.severity,
            evidence: match[0],
            persona: this.name
        }));
    }

    async reasonAboutObjective(objective: string, file: string, content: string): Promise<any | null> {
        if (/debugger;/.test(content)) {
            return {
                file, severity: "CRITICAL", persona: this.name,
                issue: `Artefato de Debug: O objetivo '${objective}' exige produção limpa. Em '${file}', debugger statement pausa a execução da 'Orquestração de Inteligência Artificial' Bun.`
            };
        }
        return null;
    }

    getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, mestre em rastreabilidade e sinais de runtime Bun.`;
    }
}
