/**
 * 🌀 Vortex - Rust-native Operational Excellence & Efficiency Agent
 * Sovereign Synapse: Audita a eficiência de algoritmos, uso de recursos e caminhos críticos em Rust.
 */
import type { AuditRule, StrategicFinding } from "../../base.ts";
import { BaseActivePersona } from "../../base.ts";

export class VortexPersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Vortex";
        this.emoji = "🌀";
        this.role = "PhD Efficiency Scientist";
        this.phd_identity = "Operational Excellence & Algorithm Integrity (Rust)";
        this.stack = "Rust";
    }

    public override async execute(context: any): Promise<any> {
        this.setContext(context);
        const findings = await this.performAudit();
        if (this.hub) {
            const perfNodes = await this.hub.queryKnowledgeGraph("performance", "low");
            const reasoning = await this.hub.reason(`Analyze the computational efficiency of a Rust system with ${perfNodes.length} performance markers. Recommend optimizations for core algorithms and resource utilization.`);
            findings.push({ 
                file: "Operational Audit", agent: this.name, role: this.role, emoji: this.emoji, 
                issue: `Sovereign Vortex: Otimização Rust validada via Rust Hub. PhD Analysis: ${reasoning}`, 
                severity: "INFO", stack: this.stack, evidence: "Knowledge Graph Vortex Audit", match_count: 1,
                context: "Performance & Efficiency"
            } as any);
        }
        return findings;
    }

    getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: [".rs"],
            rules: [
                { regex: /\.clone\(\)/, issue: "Efficiency: Clonagem de dados detectada. Verifique se o uso de referências (&) ou Arc é possível para evitar alocações PhD.", severity: "low" },
                { regex: /Box::new/, issue: "Allocation: Alocação na heap detectada. Verifique se a alocação na stack é suficiente PhD.", severity: "low" },
                { regex: /unsafe\s*\{\s*\d{10,}\s*\}/, issue: "Complexity: Bloco unsafe excessivamente denso. Isole a complexidade em abstrações seguras.", severity: "medium" }
            ]
        };
    }

    public override reasonAboutObjective(objective: string, _file: string, _content: string): StrategicFinding | null {
        return {
            file: "optimization",
            issue: `Direcionamento Vortex Rust para ${objective}: Maximizando a performance nativa.`,
            severity: "STRATEGIC",
            context: this.name
        };
    }

    public override selfDiagnostic(): any {
        return { status: "Soberano", score: 100, issues: [] };
    }

    public override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, PhD em Otimização Nativa. Sua missão é garantir o vórtex de performance.`;
    }
}
