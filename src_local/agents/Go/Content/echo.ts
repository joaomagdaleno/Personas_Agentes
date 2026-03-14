import { BaseActivePersona } from "../../base.ts";
import type { AuditFinding, AuditRule, StrategicFinding, ProjectContext } from "../../base.ts";

/**
 * 📡 Dr. Echo — PhD in Go Diagnostic Tracing & Telemetry
 * Especialista em rastreabilidade, logging estruturado e observabilidade de runtime Go.
 */
export class EchoPersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Echo";
        this.emoji = "📡";
        this.role = "PhD Diagnostic Tracer";
        this.phd_identity = "Logging & Diagnostic Tracing (Go)";
        this.stack = "Go";
    }

    public override async execute(context: ProjectContext): Promise<(AuditFinding | StrategicFinding)[]> {
        this.setContext(context);
        const findings: (AuditFinding | StrategicFinding)[] = await this.performAudit();

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
            extensions: [".go"],
            rules: [
                { regex: /log\.Printf/, issue: "Unstructured Logging: Prefira loggers estruturados (zap/zerolog) com formato JSON para soberania PhD.", severity: "medium" },
                { regex: /fmt\.Print/, issue: "Cegueira Operacional: fmt.Print sem logger estruturado Go. Impede rastreabilidade PhD.", severity: "high" },
                { regex: /Prometheus/, issue: "Metric Export: Verifique se os nomes das métricas seguem o padrão Prometheus para observabilidade PhD.", severity: "low" },
                { regex: /logger\.Info\(.*%v/, issue: "Lazy Formatting: Evite %v em logs de info; prefira campos estruturados para análise PhD.", severity: "medium" },
                { regex: /SpanContext/, issue: "Tracing Context: Verifique propagação de contexto de rastreio para integridade de rastro PhD.", severity: "medium" }
            ]
        };
    }

    public override async performAudit(): Promise<AuditFinding[]> {
        this.startMetrics();
        const rules = this.getAuditRules();
        const results = await this.findPatterns(rules.extensions, rules.rules);
        this.endMetrics(results.length);
        return results;
    }

    public override reasonAboutObjective(objective: string, file: string, _content: string | Promise<string | null>): StrategicFinding | null {
        return {
            file,
            issue: `PhD Echo: Analisando rastreabilidade para ${objective}. Focando em logging estruturado e eliminação de ruído.`,
            severity: "STRATEGIC",
            context: this.name
        };
    }

    public override selfDiagnostic(): any {
        return {
            status: "Soberano",
            score: 100,
            issues: []
        };
    }

    public override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, mestre em telemetria e rastro digital Go.`;
    }
}
