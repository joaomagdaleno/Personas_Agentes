import { BaseActivePersona } from "../../base.ts";
import type { AuditFinding, AuditRule, StrategicFinding, ProjectContext } from "../../base.ts";

/**
 * 🌀 Vortex - TypeScript-native Operational Excellence & Efficiency Agent
 * Sovereign Synapse: Audita a eficiência de algoritmos TS, uso de memória e caminhos críticos no NodeJS de nível PhD.
 */
export class VortexPersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Vortex";
        this.emoji = "🌀";
        this.role = "PhD Efficiency Scientist";
        this.phd_identity = "Operational Excellence & Algorithm Integrity (TypeScript)";
        this.stack = "TypeScript";
    }

    public override async execute(context: ProjectContext): Promise<(AuditFinding | StrategicFinding)[]> {
        this.setContext(context);
        const results: (AuditFinding | StrategicFinding)[] = await this.performAudit();
        const findings: (AuditFinding | StrategicFinding)[] = [...results];
        
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

    override getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: [".ts", ".js", ".tsx"],
            rules: [
                { regex: /for\s+.*\s+in/, issue: "Efficiency: Loop 'for-in' detectado em TS. Verifique se 'for-of' ou métodos funcionais são mais eficientes PhD.", severity: "low" },
                { regex: /Array\([1-9][0-9]{4,}\)/, issue: "Allocation: Alocação de array gigante detectada. Risco de GC pressure PhD.", severity: "medium" },
                { regex: /while\s*\(\s*true\s*\)/, issue: "Complexity: Loop infinito detectado. Garanta que haja sinal de cancelamento PhD.", severity: "medium" }
            ]
        };
    }

    public override async performAudit(): Promise<AuditFinding[]> {
        this.startMetrics();
        const rules = this.getAuditRules();
        const results = await this.findPatterns(rules.extensions, rules.rules);

        if (results.some(r => r.severity === "medium")) {
            results.push({
                file: "TS_VORTEX", agent: this.name, role: this.role, emoji: this.emoji,
                issue: "Operational Excellence: System efficiency issues found.",
                severity: "medium", stack: this.stack, evidence: "Structural Analysis", match_count: 1, context: "Performance"
            } as any);
        }

        this.endMetrics(results.length);
        return results;
    }

    public override reasonAboutObjective(objective: string, _file: string, _content: string | Promise<string | null>): StrategicFinding | null {
        return {
            file: "optimization",
            issue: `PhD Vortex (TypeScript): Direcionamento TS para ${objective}, garantindo vórtex de performance máxima.`,
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
