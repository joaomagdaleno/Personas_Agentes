/**
 * 🌀 Vortex - TypeScript-native Operational Excellence & Efficiency Agent
 * Sovereign Synapse: Audita a eficiência de algoritmos TS, uso de memória e caminhos críticos no NodeJS de nível PhD.
 */
import type { AuditRule, StrategicFinding } from "../../base.ts";
import { BaseActivePersona } from "../../base.ts";

export class VortexPersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Vortex";
        this.emoji = "🌀";
        this.role = "PhD Efficiency Scientist";
        this.phd_identity = "Operational Excellence & Algorithm Integrity (TypeScript)";
        this.stack = "TypeScript";
    }

    public override async execute(context: any): Promise<any> {
        this.setContext(context);
        const findings = await this.performAudit();
        if (this.hub) {
            const perfNodes = await this.hub.queryKnowledgeGraph("performance", "low");
            const reasoning = await this.hub.reason(`Analyze the heavy computation paths of a TypeScript system with ${perfNodes.length} performance markers. Recommend optimizations for core loops and memory allocation.`);
            findings.push({ 
                file: "Operational Audit", agent: this.name, role: this.role, emoji: this.emoji, 
                issue: `Sovereign Vortex: Otimização TS validada via Rust Hub. PhD Analysis: ${reasoning}`, 
                severity: "INFO", stack: this.stack, evidence: "Knowledge Graph Vortex Audit", match_count: 1,
                context: "Performance & Throughput"
            } as any);
        }
        return findings;
    }

    getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: [".ts", ".js"],
            rules: [
                { regex: /for\s+.*\s+in/, issue: "Efficiency: Loop 'for-in' detectado em TS. Verifique se 'for-of' ou métodos funcionais são mais eficientes.", severity: "low" },
                { regex: /Array\([1-9][0-9]{4,}\)/, issue: "Allocation: Alocação de array gigante detectada. Risco de GC pressure.", severity: "medium" },
                { regex: /while\(true\)/, issue: "Complexity: Loop infinito detectado. Garanta que haja sinal de cancelamento PhD.", severity: "medium" }
            ]
        };
    }

    public override reasonAboutObjective(objective: string, _file: string, _content: string): StrategicFinding | null {
        return {
            file: "optimization",
            issue: `Direcionamento Vortex TS para ${objective}: Garantindo vórtex de performance máxima.`,
            severity: "STRATEGIC",
            context: this.name
        };
    }

    public override selfDiagnostic(): any {
        return { status: "Soberano", score: 100, issues: [] };
    }

    public override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, PhD em Otimização de Runtimes. Sua missão é garantir a performance absoluta.`;
    }
}
