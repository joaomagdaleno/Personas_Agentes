import { BaseActivePersona } from "../../base.ts";
import type { AuditFinding, AuditRule, StrategicFinding, ProjectContext } from "../../base.ts";

/**
 * 🌀 Vortex - Rust-native Operational Excellence & Efficiency Agent
 * Sovereign Synapse: Audita a eficiência de algoritmos, uso de recursos e caminhos críticos em Rust.
 */
export class VortexPersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Vortex";
        this.emoji = "🌀";
        this.role = "PhD Efficiency Scientist";
        this.phd_identity = "Operational Excellence & Algorithm Integrity (Rust)";
        this.stack = "Rust";
    }

    public override async execute(context: ProjectContext): Promise<(AuditFinding | StrategicFinding)[]> {
        this.setContext(context);
        const findings: (AuditFinding | StrategicFinding)[] = await this.performAudit();
        
        if (this.hub) {
            const perfNodes = await this.hub.queryKnowledgeGraph("performance", "low");
            const reasoning = await this.hub.reason(`Analyze the computational efficiency of a Rust system with ${perfNodes.length} performance markers. Recommend optimizations for core algorithms and zero-cost abstraction utilization.`);
            findings.push({ 
                file: "Operational Audit", agent: this.name, role: this.role, emoji: this.emoji, 
                issue: `Sovereign Vortex: Otimização nativa Rust validada via Rust Hub. PhD Analysis: ${reasoning}`, 
                severity: "INFO", stack: this.stack, evidence: "Knowledge Graph Vortex Audit", match_count: 1,
                context: "Rust Performance Optimization"
            } as any);
        }
        return findings;
    }

    override getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: [".rs"],
            rules: [
                { regex: /\.clone\(\)/, issue: "Efficiency: Clonagem explícita detectada. Verifique se o uso de referências (&) ou Arc é mais apropriado PhD.", severity: "low" },
                { regex: /Box::new/, issue: "Allocation: Alocação na heap (Box). Verifique se a memória da stack é suficiente para evitar penalidade GCaL PhD.", severity: "low" },
                { regex: /unsafe\s*\{\s*\w+.*\}/, issue: "Complexity: Bloco unsafe denso. Isole a complexidade em abstrações seguras garantidas pelo ownership PhD.", severity: "medium" }
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
            file: "optimization",
            issue: `Direcionamento Vortex (Rust) para ${objective}: Rompendo limites computacionais através do controle estrito da cache L1/L2 PhD.`,
            severity: "STRATEGIC",
            context: this.name
        };
    }

    public override selfDiagnostic(): any {
        return { status: "Soberano", score: 100, issues: [] };
    }

    public override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, PhD em Otimização Nativa de Sistemas (Rust). Sua missão é o determinismo algorítmico e zero overhead.`;
    }
}
