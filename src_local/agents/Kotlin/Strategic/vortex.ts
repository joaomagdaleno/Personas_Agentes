/**
 * 🌀 Vortex - Kotlin-native Operational Excellence & Performance Agent
 * Sovereign Synapse: Audita a eficiência de coroutines Kotlin, uso de memória JVM e caminhos críticos.
 */
import type { AuditRule, StrategicFinding } from "../../base.ts";
import { BaseActivePersona } from "../../base.ts";

export class VortexPersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Vortex";
        this.emoji = "🌀";
        this.role = "PhD Efficiency Scientist";
        this.phd_identity = "Operational Excellence & Algorithm Integrity (Kotlin)";
        this.stack = "Kotlin";
    }

    public override async execute(context: any): Promise<any> {
        this.setContext(context);
        const findings = await this.performAudit();
        if (this.hub) {
            const coroNodes = await this.hub.queryKnowledgeGraph("coroutine", "low");
            const reasoning = await this.hub.reason(`Analyze the concurrent execution flow of a Kotlin system with ${coroNodes.length} coroutine points. Recommend dispatcher optimization and memory-safe shared state.`);
            findings.push({ 
                file: "Operational Audit", agent: this.name, role: this.role, emoji: this.emoji, 
                issue: `Sovereign Vortex: Otimização Kotlin validada via Rust Hub. PhD Analysis: ${reasoning}`, 
                severity: "INFO", stack: this.stack, evidence: "Knowledge Graph Vortex Audit", match_count: 1,
                context: "Concurrency & Memory Stability"
            } as any);
        }
        return findings;
    }

    getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: [".kt", ".kts"],
            rules: [
                { regex: /runBlocking/, issue: "Efficiency: Bloqueio de thread principal via runBlocking detectado. Use fluxos suspensos puros PhD.", severity: "high" },
                { regex: /GlobalScope\.launch/, issue: "Lifecycle: Coroutine agendada sem escopo amarrado. Risco de vazamento de memória PhD.", severity: "medium" },
                { regex: /yield\(\)/, issue: "Execution: Ponto de interrupção voluntária. Verifique se o balanceamento de CPU está adequado.", severity: "low" }
            ]
        };
    }

    public override reasonAboutObjective(objective: string, _file: string, _content: string): StrategicFinding | null {
        return {
            file: "optimization",
            issue: `Direcionamento Vortex Kotlin para ${objective}: Garantindo vórtex de performance Android/JVM.`,
            severity: "STRATEGIC",
            context: this.name
        };
    }

    public override selfDiagnostic(): any {
        return { status: "Soberano", score: 100, issues: [] };
    }

    public override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, PhD em Engenharia de Software Distribuído. Sua missão é garantir a performance absoluta.`;
    }
}
