import { BaseActivePersona } from "../../base.ts";
import type { AuditRule, StrategicFinding } from "../../base.ts";


/**
 * 📡 Dr. Echo — PhD in Bun Diagnostic Tracing & Runtime Signals
 * Especialista em rastreamento de execução Bun, debugger statements e process signals.
 */
export class EchoPersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot as any);
        this.name = "Echo";
        this.emoji = "📡";
        this.role = "PhD Bun Diagnostic Tracer";
        this.phd_identity = "Diagnostic Tracing & Runtime Signals (Bun)";
        this.stack = "Bun";
    }

    public override async execute(context: any): Promise<any> {
        this.setContext(context);
        const findings = await this.performAudit();

        if (this.hub) {
            const logNodes = await this.hub.queryKnowledgeGraph("console.log", "high");
            const reasoning = await this.hub.reason(`Analyze the diagnostic tracing maturity of a Bun system with ${logNodes.length} unstructured logging points. Recommend migration to structured logging.`);

            findings.push({
                file: "Diagnostic Tracing", agent: this.name, role: this.role, emoji: this.emoji,
                issue: `Sovereign Echo: Rastreabilidade Bun validada via Rust Hub. PhD Analysis: ${reasoning}`,
                severity: "INFO", stack: this.stack, evidence: "Knowledge Graph Logging Audit", match_count: 1
            } as any);
        }
        return findings;
    }

    override getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
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

    override reasonAboutObjective(objective: string, file: string, content: string | Promise<string | null>): StrategicFinding | string | null {
        if (typeof content !== 'string') return null;
        const target = /debugger;/;
        if (target["test"](content)) {
            return {
                file, severity: "CRITICAL",
                issue: `Artefato de Debug: O objetivo '${objective}' exige produção limpa. Em '${file}', debugger statement pausa a execução da 'Orquestração de Inteligência Artificial' Bun.`,
                context: "debugger statement detected"
            };
        }
        return null;
    }

    override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, mestre em rastreabilidade e sinais de runtime Bun.`;
    }
}
