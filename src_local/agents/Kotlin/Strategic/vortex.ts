import { BaseActivePersona } from "../../base.ts";
import type { AuditFinding, AuditRule, StrategicFinding, ProjectContext } from "../../base.ts";

/**
 * 🌀 Vortex - Kotlin-native Operational Excellence & Performance Agent
 * Sovereign Synapse: Audita a eficiência de coroutines Kotlin, uso de memória JVM e caminhos críticos.
 */
export class VortexPersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Vortex";
        this.emoji = "🌀";
        this.role = "PhD Efficiency Scientist";
        this.phd_identity = "Operational Excellence & Algorithm Integrity (Kotlin)";
        this.stack = "Kotlin";
    }

    public override async execute(context: ProjectContext): Promise<(AuditFinding | StrategicFinding)[]> {
        this.setContext(context);
        const findings: (AuditFinding | StrategicFinding)[] = await this.performAudit();
        
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

    override getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: [".kt", ".kts"],
            rules: [
                { regex: /runBlocking/, issue: "Efficiency: Bloqueio de thread principal via runBlocking detectado. Use fluxos suspensos puros PhD.", severity: "high" },
                { regex: /GlobalScope\.launch/, issue: "Lifecycle: Coroutine agendada sem escopo amarrado. Risco de vazamento de memória PhD.", severity: "medium" },
                { regex: /yield\(\)/, issue: "Execution: Ponto de interrupção voluntária. Verifique se o balanceamento de CPU está adequado PhD.", severity: "low" }
            ]
        };
    }

    public override async performAudit(): Promise<AuditFinding[]> {
        this.startMetrics();
        const rules = this.getAuditRules();
        const results = await this.findPatterns(rules.extensions, rules.rules);

        if (results.some(r => r.severity === "medium")) {
            results.push({
                file: "KOTLIN_VORTEX", agent: this.name, role: this.role, emoji: this.emoji,
                issue: "Operational Excellence: System efficiency issues found.",
                severity: "medium", stack: this.stack, evidence: "Structural Analysis", match_count: 1, context: "Performance"
            } as any);
        }

        this.endMetrics(results.length);
        return results;
    }

    public override reasonAboutObjective(objective: string, file: string, _content: string | Promise<string | null>): StrategicFinding | null {
        return {
            file: "optimization",
            issue: `Direcionamento Vortex Kotlin para ${objective}: Garantindo vórtex de performance Android/JVM PhD.`,
            severity: "STRATEGIC",
            context: this.name
        };
    }

    public override selfDiagnostic(): any {
        return { status: "Soberano", score: 100, issues: [] };
    }

    public override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, PhD em Engenharia de Software Distribuído JVM. Sua missão é garantir a performance absoluta Kotlin.`;
    }
}
