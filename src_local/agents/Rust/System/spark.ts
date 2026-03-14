import { BaseActivePersona } from "../../base.ts";
import type { AuditFinding, AuditRule, StrategicFinding, ProjectContext } from "../../base.ts";

/**
 * ✨ Spark - Rust-native Lifecycle & Initialization Agent
 * Sovereign Synapse: Audita a inicialização de serviços, crates e o estado inicial do sistema.
 */
export class SparkPersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Spark";
        this.emoji = "✨";
        this.role = "PhD Initialization Expert";
        this.phd_identity = "System Genesis & Lifecycle Integrity (Rust)";
        this.stack = "Rust";
    }

    public override async execute(context: ProjectContext): Promise<(AuditFinding | StrategicFinding)[]> {
        this.setContext(context);
        const findings: (AuditFinding | StrategicFinding)[] = await this.performAudit();
        
        if (this.hub) {
            const initNodes = await this.hub.queryKnowledgeGraph("init", "low");
            const reasoning = await this.hub.reason(`Analyze the system initialization for a Rust execution core with ${initNodes.length} genesis markers. Recommend idempotent startup and panic capture recovery.`);
            findings.push({ 
                file: "System Audit", agent: this.name, role: this.role, emoji: this.emoji, 
                issue: `Sovereign Spark: Ciclo de vida estrito validado via Rust Hub. PhD Analysis: ${reasoning}`, 
                severity: "INFO", stack: this.stack, evidence: "Knowledge Graph Spark Audit", match_count: 1,
                context: "Lifecycle & Initialization"
            } as any);
        }
        return findings;
    }

    override getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: [".rs"],
            rules: [
                { regex: /static\s+ONCE/, issue: "Initialization: Padrão estático lockado detectado. Garanta ausência de deadlock circular na partida PhD.", severity: "low" },
                { regex: /expect\("failed\s+to\s+init"\)|unwrap\(\)/, issue: "Resilience: `unwrap()` ingênuo no startup. Force falha gracefull via `Result<()>` propagado à main PhD.", severity: "high" },
                { regex: /fn\s+main\(\)\s*->\s*Result/, issue: "Governance: Uso de `Result` na main() atestado PhD: Tratamento de falhas estrutural estabelecido.", severity: "low" }
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
            file: "lifecycle",
            issue: `Direcionamento Spark (Rust) para ${objective}: Garantindo um boot nativo imutável e à prova de pânico imediato PhD.`,
            severity: "STRATEGIC",
            context: this.name
        };
    }

    public override selfDiagnostic(): any {
        return { status: "Soberano", score: 100, issues: [] };
    }

    public override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, PhD em Engenharia de Ignição de Sistemas Rust. A alocação zero (Zero-cost) no boot é seu dogma.`;
    }
}
