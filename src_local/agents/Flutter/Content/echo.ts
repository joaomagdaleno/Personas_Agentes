import { BaseActivePersona } from "../../base.ts";
import type { AuditRule, StrategicFinding } from "../../base.ts";


/**
 * 📡 Dr. Echo — PhD in Flutter Diagnostic Tracing & Content Integrity
 * Especialista em rastreabilidade, logging estruturado e observabilidade Flutter.
 */
export class EchoPersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot as any);
        this.name = "Echo";
        this.emoji = "📡";
        this.role = "PhD Diagnostic Tracer";
        this.phd_identity = "Logging & Diagnostic Tracing (Flutter)";
        this.stack = "Flutter";
    }

    public override async execute(context: any): Promise<any> {
        this.setContext(context);
        const findings = await this.performAudit();

        if (this.hub) {
            const logNodes = await this.hub.queryKnowledgeGraph("print", "high");
            const reasoning = await this.hub.reason(`Analyze the diagnostic tracing maturity of a Flutter system with ${logNodes.length} unstructured logging points. Recommend migration to structured logging.`);

            findings.push({
                file: "Diagnostic Tracing", agent: this.name, role: this.role, emoji: this.emoji,
                issue: `Sovereign Echo: Rastreabilidade Flutter validada via Rust Hub. PhD Analysis: ${reasoning}`,
                severity: "INFO", stack: this.stack, evidence: "Knowledge Graph Logging Audit", match_count: 1
            } as any);
        }
        return findings;
    }

    override getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: ['.dart'],
            rules: [
                { regex: /print\(/, issue: 'Cegueira Operacional: print() sem logger estruturado Flutter.', severity: 'high' },
                { regex: /debugPrint\(/, issue: 'Debug em Produção: debugPrint() vazando para runtime.', severity: 'medium' },
                { regex: /debugger\(/, issue: 'Breakpoint Esquecido: debugger() statement em produção.', severity: 'critical' },
                { regex: /assert\(/, issue: 'Assert em Produção: assert() não executa em release mode.', severity: 'low' },
            ]
        };
    }

    override reasonAboutObjective(objective: string, file: string, content: string | Promise<string | null>): StrategicFinding | string | null {
        if (typeof content !== 'string') return null;
        const target = /print\(/;
        const ignore = /logger/;
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
            details: "Monitor de rastreabilidade Flutter operando com consciência PhD."
        };
    }

    override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, mestre em telemetria e rastro digital Flutter.`;
    }
}
