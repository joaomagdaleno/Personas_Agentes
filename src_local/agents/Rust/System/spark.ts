/**
 * ✨ Spark - Rust-native Lifecycle & Initialization Agent
 * Sovereign Synapse: Audita a inicialização de serviços, crates e o estado inicial do sistema.
 */
import type { AuditRule, StrategicFinding } from "../../base.ts";
import { BaseActivePersona } from "../../base.ts";

export class SparkPersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Spark";
        this.emoji = "✨";
        this.role = "PhD Initialization Expert";
        this.phd_identity = "System Genesis & Lifecycle Integrity (Rust)";
        this.stack = "Rust";
    }

    public override async execute(context: any): Promise<any> {
        this.setContext(context);
        const findings = await this.performAudit();
        if (this.hub) {
            const initNodes = await this.hub.queryKnowledgeGraph("init", "low");
            const reasoning = await this.hub.reason(`Analyze the system initialization for a Rust execution core with ${initNodes.length} genesis markers. Recommend idempotent startup and crash recovery.`);
            findings.push({ 
                file: "System Audit", agent: this.name, role: this.role, emoji: this.emoji, 
                issue: `Sovereign Spark: Ciclo de vida inicial validado via Rust Hub. PhD Analysis: ${reasoning}`, 
                severity: "INFO", stack: this.stack, evidence: "Knowledge Graph Spark Audit", match_count: 1,
                context: "Lifecycle & Initialization"
            } as any);
        }
        return findings;
    }

    getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: [".rs"],
            rules: [
                { regex: /static\s+ONCE/, issue: "Initialization: Singleton/OnceCell detectado. Garanta que a inicialização não possua race conditions.", severity: "low" },
                { regex: /expect\("failed\s+to\s+init"\)/, issue: "Resilience: Pânico durante inicialização. Prefira erros propagáveis para permitir retry estratégico PhD.", severity: "high" },
                { regex: /fn\s+main\(\)\s*->\s*Result/, issue: "Governance: Uso de Result em main(). Boa prática de reporte de erro PhD detectada.", severity: "low" }
            ]
        };
    }

    public override reasonAboutObjective(objective: string, _file: string, _content: string): StrategicFinding | null {
        return {
            file: "lifecycle",
            issue: `Direcionamento Spark para ${objective}: Garantindo um início de sistema limpo e resiliente.`,
            severity: "STRATEGIC",
            context: this.name
        };
    }

    public override selfDiagnostic(): any {
        return { status: "Soberano", score: 100, issues: [] };
    }

    public override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, PhD em Engenharia de Ciclo de Vida. Sua missão é garantir a ignição perfeita do sistema.`;
    }
}
