import { BaseActivePersona } from "../../base.ts";
import type { AuditRule, StrategicFinding } from "../../base.ts";


/**
 * 📡 Dr. Echo — PhD in Go Diagnostic Tracing & Telemetry
 * Especialista em rastreabilidade, logging estruturado e observabilidade de runtime Go.
 */
export class EchoPersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot as any);
        this.name = "Echo";
        this.emoji = "📡";
        this.role = "PhD Diagnostic Tracer";
        this.phd_identity = "Logging & Diagnostic Tracing (Go)";
        this.stack = "Go";
    }

    public override async execute(context: any): Promise<any> {
        this.setContext(context);
        const findings = await this.performAudit();

        if (this.hub) {
            const logNodes = await this.hub.queryKnowledgeGraph("fmt.Print", "high");
            const reasoning = await this.hub.reason(`Analyze the diagnostic tracing maturity of a Go system with ${logNodes.length} unstructured logging points. Recommend migration to structured logging.`);

            findings.push({
                file: "Diagnostic Tracing", agent: this.name, role: this.role, emoji: this.emoji,
                issue: `Sovereign Echo: Rastreabilidade Go validada via Rust Hub. PhD Analysis: ${reasoning}`,
                severity: "INFO", stack: this.stack, evidence: "Knowledge Graph Logging Audit", match_count: 1
            } as any);
        }
        return findings;
    }

    override getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: ['.go'],
            rules: [
                { regex: /log\.Printf/, issue: 'Unstructured Logging: Prefira loggers estruturados (zap/zerolog) com formato JSON.', severity: 'medium' },
                { regex: /fmt\.Print/, issue: 'Cegueira Operacional: fmt.Print sem logger estruturado Go.', severity: 'high' },
                { regex: /Prometheus/, issue: 'Metric Export: Verifique se os nomes das métricas seguem o padrão Prometheus.', severity: 'low' },
                { regex: /logger\.Info\(.*%v/, issue: 'Lazy Formatting: Evite %v em logs de info; prefira campos estruturados.', severity: 'medium' },
                { regex: /SpanContext/, issue: 'Tracing Context: Verifique propagação de contexto de rastreio.', severity: 'medium' },
            ]
        };
    }

    override reasonAboutObjective(objective: string, file: string, content: string | Promise<string | null>): StrategicFinding | string | null {
        if (typeof content !== 'string') return null;
        const target = /fmt\.Print/;
        if (target["test"](content)) {
            return {
                file, severity: "HIGH",
                issue: `Cegueira Operacional: O objetivo '${objective}' exige diagnóstico. Em '${file}', o uso de fmt.Print impede a rastreabilidade da 'Orquestração de Inteligência Artificial'.`,
                context: "fmt.Print usages detected"
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
            details: "Monitor de rastreabilidade Go operando com consciência PhD."
        };
    }

    override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, mestre em telemetria e rastro digital Go.`;
    }
}
