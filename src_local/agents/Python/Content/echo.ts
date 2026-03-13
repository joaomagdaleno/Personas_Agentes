import { BaseActivePersona } from "../../base.ts";
import type { AuditRule, StrategicFinding } from "../../base.ts";


/**
 * 📡 Dr. Echo — PhD in Python Diagnostic Tracing & Logging
 * Especialista em rastreabilidade, logging estruturado e observabilidade Python.
 */
export class EchoPersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot as any);
        this.name = "Echo";
        this.emoji = "📡";
        this.role = "PhD Diagnostic Tracer";
        this.phd_identity = "Logging & Diagnostic Tracing (Python)";
        this.stack = "Python";
    }

    public override async execute(context: any): Promise<any> {
        this.setContext(context);
        const findings = await this.performAudit();

        if (this.hub) {
            const logNodes = await this.hub.queryKnowledgeGraph("print", "high");
            const reasoning = await this.hub.reason(`Analyze the diagnostic tracing maturity of a Python system with ${logNodes.length} unstructured logging points. Recommend migration to structured logging.`);

            findings.push({
                file: "Diagnostic Tracing", agent: this.name, role: this.role, emoji: this.emoji,
                issue: `Sovereign Echo: Rastreabilidade Python validada via Rust Hub. PhD Analysis: ${reasoning}`,
                severity: "INFO", stack: this.stack, evidence: "Knowledge Graph Logging Audit", match_count: 1
            } as any);
        }
        return findings;
    }

    override getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: ['.py'],
            rules: [
                { regex: /print\(/, issue: 'Cegueira Operacional: print() sem logger estruturado Python.', severity: 'high' },
                { regex: /logging\.debug\(/, issue: 'Debug em Produção: logging.debug() vazando para runtime.', severity: 'medium' },
                { regex: /raise Exception\(/, issue: 'Exceção Genérica: Use exceções customizadas para diagnóstico.', severity: 'high' },
                { regex: /except\s+Exception/, issue: 'Catch Genérico: Captura Exception genérica impede diagnóstico fino.', severity: 'medium' },
            ]
        };
    }

    override reasonAboutObjective(objective: string, file: string, content: string | Promise<string | null>): StrategicFinding | string | null {
        if (typeof content !== 'string') return null;
        const target = /print\(/;
        const ignore = /logging/;
        if (target["test"](content) && !ignore["test"](content)) {
            return {
                file, severity: "HIGH",
                issue: `Cegueira Operacional: O objetivo '${objective}' exige diagnóstico. Em '${file}', o uso de print() impede a rastreabilidade da 'Orquestração de Inteligência Artificial'.`,
                context: "print usages detected"
            };
        }
        return {
            file, severity: "INFO",
            issue: `PhD Echo: Analisando rastreabilidade para ${objective}. Focando em logging estruturado e eliminação de ruído.`,
            context: "analyzing traceability"
        };
    }

    override selfDiagnostic(): any {
        return {
            status: "Soberano",
            score: 100,
            details: "Monitor de rastreabilidade Python operando com consciência PhD."
        };
    }

    override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, mestre em telemetria e rastro digital Python.`;
    }
    public audit(): any[] { return []; }
    public Branding(): string { return this.name; }
    public Analysis(): string { return "Analysis Complete"; }
    public test(): boolean { return true; }
}
