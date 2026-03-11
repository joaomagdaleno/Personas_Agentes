/**
 * 📡 Echo - Rust-native Diagnostic Tracing Agent
 * Sovereign Synapse: Audita a maturidade de logging e telemetria do ecossistema Rust.
 */
import type { AuditRule, StrategicFinding } from "../../base.ts";
import { BaseActivePersona } from "../../base.ts";

export class EchoPersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Echo";
        this.emoji = "📡";
        this.role = "PhD Diagnostic Tracer";
        this.phd_identity = "Rust Telemetry & Tracing Ecosystem";
        this.stack = "Rust";
    }

    public override async execute(context: any): Promise<any> {
        this.setContext(context);
        const findings = await this.performAudit();

        if (this.hub) {
            const logNodes = await this.hub.queryKnowledgeGraph("println!", "high");
            const reasoning = await this.hub.reason(`Analyze the telemetry maturity of the Rust ecosystem with ${logNodes.length} unstructured println!/eprintln! points. Recommend migration to tracing crate.`);

            findings.push({
                file: "Diagnostic Tracing", agent: this.name, role: this.role, emoji: this.emoji,
                issue: `Sovereign Echo: Telemetria Rust auditada nativamente. PhD Analysis: ${reasoning}`,
                severity: "INFO", stack: this.stack, evidence: "Knowledge Graph Tracing Audit", match_count: 1
            } as any);
        }
        return findings;
    }

    getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: [".rs"],
            rules: [
                { regex: /println!\(/, issue: "Unstructured Output: println! detectado; use tracing::info! para telemetria estruturada.", severity: "high" },
                { regex: /eprintln!\(/, issue: "Error Output: eprintln! detectado; use tracing::error! com spans para rastreamento.", severity: "medium" },
                { regex: /dbg!\(/, issue: "Debug Leak: dbg! macro em código — remover antes de produção.", severity: "critical" },
                { regex: /log::/, issue: "Legacy Logger: Crate log detectada; migre para tracing para compatibilidade com tokio.", severity: "low" }
            ]
        };
    }

    public override reasonAboutObjective(objective: string, _file: string, _content: string): StrategicFinding | null {
        return {
            file: "tracing",
            issue: `Direcionamento Rust Echo para ${objective}: Garantindo maturidade de telemetria via tracing crate.`,
            severity: "STRATEGIC",
            context: this.name
        };
    }

    public override selfDiagnostic(): { status: string; score: number; issues: string[]; } {
        return { status: "Soberano", score: 100, issues: [] };
    }

    public override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, PhD em Telemetria Rust. Sua missão é garantir observabilidade total via tracing e OpenTelemetry.`;
    }
}
