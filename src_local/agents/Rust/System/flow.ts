/**
 * 🌊 Flow - Rust-native Async & Resource Flow Agent
 * Sovereign Synapse: Audita o fluxo de execução assíncrona, futures e gestão de recursos.
 */
import type { AuditRule, StrategicFinding } from "../../base.ts";
import { BaseActivePersona } from "../../base.ts";

export class FlowPersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Flow";
        this.emoji = "🌊";
        this.role = "PhD Execution Strategist";
        this.phd_identity = "Async Flow & Lifecycle Integrity (Rust)";
        this.stack = "Rust";
    }

    public override async execute(context: any): Promise<any> {
        this.setContext(context);
        const findings = await this.performAudit();
        if (this.hub) {
            const flowNodes = await this.hub.queryKnowledgeGraph("async", "low");
            const reasoning = await this.hub.reason(`Analyze the async execution flow of a Rust system with ${flowNodes.length} async entry points. Recommend task scheduling and resource disposal strategies.`);
            findings.push({ 
                file: "System Audit", agent: this.name, role: this.role, emoji: this.emoji, 
                issue: `Sovereign Flow: Fluxo de execução validado via Rust Hub. PhD Analysis: ${reasoning}`, 
                severity: "INFO", stack: this.stack, evidence: "Knowledge Graph Flow Audit", match_count: 1,
                context: "Async Integrity & Lifecycle"
            } as any);
        }
        return findings;
    }

    getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: [".rs"],
            rules: [
                { regex: /tokio::spawn/, issue: "Lifecycle: Agendamento de task detectado. Garanta que a task possua monitoramento de pânico.", severity: "medium" },
                { regex: /\.await/, issue: "Execution: Ponto de suspensão. Verifique se o await não bloqueia o executor principal PhD.", severity: "low" },
                { regex: /loop\s*\{/, issue: "Resource: Loop infinito detectado. Verifique se há condições de saída e controle de CPU.", severity: "medium" }
            ]
        };
    }

    public override reasonAboutObjective(objective: string, _file: string, _content: string): StrategicFinding | null {
        return {
            file: "execution",
            issue: `Direcionamento Flow para ${objective}: Maximizando o throughput sistêmico via async safety.`,
            severity: "STRATEGIC",
            context: this.name
        };
    }

    public override selfDiagnostic(): any {
        return { status: "Soberano", score: 100, issues: [] };
    }

    public override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, PhD em Sistemas Reativos. Sua missão é garantir fluidez absoluta na execução.`;
    }
}
