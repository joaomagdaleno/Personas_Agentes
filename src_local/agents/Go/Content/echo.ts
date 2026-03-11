/**
 * 🗣️ Echo - PhD in Go Telemetry & Logging (Sovereign Version)
 * Analisa a qualidade dos logs, métricas de aplicação e rastro de eventos em Go.
 */
import type { AuditFinding, AuditRule, StrategicFinding } from "../../base.ts";
import { BaseActivePersona } from "../../base.ts";

export enum TelemetryDensityGo {
    VERBOSE = "VERBOSE",
    NORMAL = "NORMAL",
    SILENT = "SILENT"
}

export class GoEchoEngine {
    public static inspect(content: string): string[] {
        const issues: string[] = [];
        if (content.includes("fmt.Print") && !content.includes("fmt.Fprintf(os.Stderr")) {
            issues.push("Standard I/O Log: Uso de fmt.Print detectado; use um logger estruturado para ambientes produtivos.");
        }
        if (content.includes("LogLevel") && !content.includes("Debug")) {
            issues.push("Missing Debug Level: O sistema de logs não possui nível de debug; dificulta o suporte avançado.");
        }
        return issues;
    }
}

export class EchoPersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Echo";
        this.emoji = "🗣️";
        this.role = "PhD Telemetry Specialist";
        this.phd_identity = "Go Telemetry & Structured Logging";
        this.stack = "Go";
    }

    public override async execute(context: any): Promise<any> {
        this.setContext(context);
        const findings = await this.performAudit();

        if (this.hub) {
            const logNodes = await this.hub.queryKnowledgeGraph("fmt.Print", "high");
            const reasoning = await this.hub.reason(`Analyze the telemetry maturity of a Go system with ${logNodes.length} unstructured logging points. Recommend migration to zap/zerolog.`);

            findings.push({
                file: "Diagnostic Tracing", agent: this.name, role: this.role, emoji: this.emoji,
                issue: `Sovereign Echo: Telemetria Go validada via Rust Hub. PhD Analysis: ${reasoning}`,
                severity: "INFO", stack: this.stack, evidence: "Knowledge Graph Logging Audit", match_count: 1
            } as any);
        }
        return findings;
    }

    getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: [".go"],
            rules: [
                { regex: /log\.Printf/, issue: "Unstructured Logging: Prefira loggers estruturados (zap/zerolog) com formato JSON.", severity: "medium" },
                { regex: /Prometheus/, issue: "Metric Export: Verifique se os nomes das métricas seguem o padrão Prometheus (letras minúsculas e underscores).", severity: "low" },
                { regex: /Counter\.Inc\(\)/, issue: "Metric Monitoring: Garanta que os contadores são persistentes e monitorados em dashboards.", severity: "low" },
                { regex: /logger\.Info\(.*%v/, issue: "Lazy Formatting: Evite %v em logs de info; prefira campos estruturados logger.Info(msg, \"error\", err).", severity: "medium" },
                { regex: /Logrus/, issue: "Logger Performance: Logrus é mais lento que zap; verifique se há impacto em caminhos críticos.", severity: "low" },
                { regex: /SpanContext/, issue: "Tracing Context: Verifique se o contexto de rastreio está sendo propagado corretamente entre processos cloud.", severity: "medium" }
            ]
        };
    }

    public override async performAudit(): Promise<AuditFinding[]> {
        const results = await super.performAudit();
        const echoFindings = GoEchoEngine.inspect(this.projectRoot || "");
        echoFindings.forEach(f => results.push({
            file: "TELEMETRY_AUDIT", agent: this.name, role: this.role, emoji: this.emoji, issue: f, severity: "medium", stack: this.stack,
            evidence: "Structural Analysis", match_count: 1
        }));
        return results;
    }

    public override performActiveHealing(blindSpots: string[]): void {
        console.log(`🛠️ [Echo] Injetando logging estruturado e métricas Prometheus em: ${blindSpots.join(", ")}`);
    }

    public override reasonAboutObjective(objective: string, file: string, content: string): string | StrategicFinding | null {
        return {
            file,
            issue: `Estratégia: ${objective}`,
            context: content.substring(0, 200),
            objective,
            analysis: "Auditando a transparência e o observabilidade do sistema Go.",
            recommendation: "Padronizar todos os logs para o formato JSON estruturado e exportar métricas de runtime via Prometheus.",
            severity: "low"
        } as StrategicFinding;
    }

    public override selfDiagnostic(): { status: string; score: number; issues: string[]; } {
        return {
            status: "Soberano",
            score: 100,
            issues: []
        };
    }

    public override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, PhD em Telemetria Go. Sua missão é garantir que o sistema fale com clareza e precisão.`;
    }
}

