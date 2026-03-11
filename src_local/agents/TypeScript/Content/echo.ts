import { BaseActivePersona } from "../../base.ts";
import type { AuditRule, StrategicFinding } from "../../base.ts";


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
        this.phd_identity = "Logging & Diagnostic Tracing (TypeScript)";
        this.stack = "TypeScript";
    }

    public override async execute(context: any): Promise<any> {
        this.setContext(context);
        const findings = await this.performAudit();

        if (this.hub) {
            const logNodes = await this.hub.queryKnowledgeGraph("console.log", "high");
            const reasoning = await this.hub.reason(`Analyze the diagnostic tracing maturity of a system with ${logNodes.length} unstructured logging points in ${this.stack}. Recommend migration to structured logging.`);

            findings.push({
                file: "Diagnostic Tracing", agent: this.name, role: this.role, emoji: this.emoji,
                issue: `Sovereign Echo: Rastreabilidade validada via Rust Hub. PhD Analysis: ${reasoning}`,
                severity: "INFO", stack: this.stack, evidence: "Knowledge Graph Logging Audit", match_count: 1
            } as any);
        }
        return findings;
    }

    getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: ['.ts', '.tsx'],
            rules: [
                { regex: /console\.log\(/, issue: 'Cegueira Operacional: console.log sem logger estruturado.', severity: 'high' },
                { regex: /console\.debug\(/, issue: 'Debug em Produção: console.debug vazando para runtime.', severity: 'medium' },
                { regex: /console\.trace\(/, issue: 'Vazamento de Stack: console.trace expondo internos.', severity: 'medium' },
                { regex: /alert\(/, issue: 'Primitivo: alert() bloqueia thread e UX.', severity: 'high' },
                { regex: /debugger;/, issue: 'Breakpoint Esquecido: debugger statement em produção.', severity: 'critical' },
            ]
        };
    }

    reasonAboutObjective(objective: string, file: string, content: string | Promise<string | null>): StrategicFinding | string | null {
        if (typeof content !== 'string') return null;
        if (/console\.(log|error|warn)\(/.test(content) && !/logger/.test(content)) {
            return {
                file, severity: "HIGH",
                issue: `Cegueira Operacional: O objetivo '${objective}' exige diagnóstico. Em '${file}', o uso de console.* impede a rastreabilidade da 'Orquestração de Inteligência Artificial'.`,
                context: "console usages detected"
            };
        }
        return {
            file, severity: "INFO",
            issue: `PhD Echo: Analisando rastreabilidade para ${objective}. Focando em logging estruturado e eliminação de ruído.`,
            context: "analyzing traceability"
        };
    }

    selfDiagnostic(): any {
        return {
            status: "Soberano",
            score: 100,
            details: "Monitor de rastreabilidade TS operando com consciência PhD."
        };
    }

    getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, mestre em telemetria e rastro digital TypeScript.`;
    }
}
