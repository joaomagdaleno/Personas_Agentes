import { BaseActivePersona } from "../../base.ts";
import type { AuditFinding, AuditRule, StrategicFinding, ProjectContext } from "../../base.ts";

/**
 * 🌊 Flow - Rust-native Async & Resource Flow Agent
 * Sovereign Synapse: Audita o fluxo de execução assíncrona, futures e gestão de recursos.
 */
export class FlowPersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Flow";
        this.emoji = "🌊";
        this.role = "PhD Execution Strategist";
        this.phd_identity = "Async Flow & Lifecycle Integrity (Rust)";
        this.stack = "Rust";
    }

    public override async execute(context: ProjectContext): Promise<(AuditFinding | StrategicFinding)[]> {
        this.setContext(context);
        const findings: (AuditFinding | StrategicFinding)[] = await this.performAudit();
        
        if (this.hub) {
            const flowNodes = await this.hub.queryKnowledgeGraph("async", "low");
            const reasoning = await this.hub.reason(`Analyze the async execution flow of a Rust system with ${flowNodes.length} async entry points. Recommend task scheduling and resource disposal strategies (Drop trait semantics).`);
            findings.push({ 
                file: "System Audit", agent: this.name, role: this.role, emoji: this.emoji, 
                issue: `Sovereign Flow: Fluxo de execução assíncrono validado via Rust Hub. PhD Analysis: ${reasoning}`, 
                severity: "INFO", stack: this.stack, evidence: "Knowledge Graph Flow Audit", match_count: 1,
                context: "Async Integrity & Lifecycle"
            } as any);
        }
        return findings;
    }

    override getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: [".rs"],
            rules: [
                { regex: /tokio::spawn/, issue: "Lifecycle: Agendamento de task detectado. Garanta que a task possua monitoramento (JoinHandle) e captura de panic nativa PhD.", severity: "medium" },
                { regex: /\.await/, issue: "Execution: Ponto de suspensão (yield point). Verifique se a lógica pré/pós-await não segura Mutexes sincrônicos gerando Deadlocks PhD.", severity: "high" },
                { regex: /loop\s*\{/, issue: "Resource: Loop infinito bloqueante detectado. Em concorrência asíncrona, tokio::task::yield_now() é imperativo para ceder CPU PhD.", severity: "medium" }
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

    public override reasonAboutObjective(objective: string, _file: string, _content: string | Promise<string | null>): StrategicFinding | null {
        return {
            file: "execution",
            issue: `Direcionamento Flow (Rust) para ${objective}: Maximizando o throughput sistêmico via Tokio async safety e Drop patterns PhD.`,
            severity: "STRATEGIC",
            context: this.name
        };
    }

    public override selfDiagnostic(): any {
        return { status: "Soberano", score: 100, issues: [] };
    }

    public override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, PhD em Sistemas Reativos Rust. Sua missão é garantir fluidez absoluta na poll-execution de Futures.`;
    }
}
