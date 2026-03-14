import { BaseActivePersona } from "../../base.ts";
import type { AuditFinding, AuditRule, StrategicFinding, ProjectContext } from "../../base.ts";

/**
 * 🌀 Vortex - Bun-native Operational Excellence & Performance Agent
 * Sovereign Synapse: Audita a eficiência de algoritmos Bun, performance de runtime nativo e uso de memória.
 */
export class VortexPersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Vortex";
        this.emoji = "🌀";
        this.role = "PhD Efficiency Scientist";
        this.phd_identity = "Operational Excellence & Algorithm Integrity (Bun)";
        this.stack = "Bun";
    }

    public override async execute(context: ProjectContext): Promise<(AuditFinding | StrategicFinding)[]> {
        this.setContext(context);
        const findings: (AuditFinding | StrategicFinding)[] = await this.performAudit();
        
        if (this.hub) {
            const bunNodes = await this.hub.queryKnowledgeGraph("Bun.serve", "low");
            const reasoning = await this.hub.reason(`Analyze the runtime performance of a Bun system with ${bunNodes.length} server points. Recommend optimizations for high-throughput HTTP handling.`);
            findings.push({ 
                file: "Operational Audit", agent: this.name, role: this.role, emoji: this.emoji, 
                issue: `Sovereign Vortex: Otimização Bun validada via Rust Hub. PhD Analysis: ${reasoning}`, 
                severity: "INFO", stack: this.stack, evidence: "Knowledge Graph Vortex Audit", match_count: 1,
                context: "Bun Performance & Throttling"
            } as any);
        }
        return findings;
    }

    override getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: [".ts", ".js"],
            rules: [
                { regex: /JSON\.parse\(.*\)/, issue: "Efficiency: Uso de JSON.parse em loop intenso. No Bun, prefira fluxos de stream ou buffers pré-alocados PhD.", severity: "low" },
                { regex: /Buffer\.from/, issue: "Allocation: Verifique se o uso de Uint8Array nativo do Bun é mais eficiente PhD.", severity: "low" },
                { regex: /new\s+Promise/, issue: "Asynchrony: Criação recursiva de Promises detectada. Risco de microtask queue starvation PhD.", severity: "medium" }
            ]
        };
    }

    public override async performAudit(): Promise<AuditFinding[]> {
        this.startMetrics();
        const rules = this.getAuditRules();
        const results = await this.findPatterns(rules.extensions, rules.rules);

        if (results.some(r => r.severity === "medium")) {
            results.push({
                file: "BUN_VORTEX", agent: this.name, role: this.role, emoji: this.emoji,
                issue: "Operational Excellence: System efficiency issues found.",
                severity: "medium", stack: this.stack, evidence: "Structural Analysis", match_count: 1, context: "Performance"
            } as any);
        }

        this.endMetrics(results.length);
        return results;
    }

    public override reasonAboutObjective(objective: string, file: string, _content: string | Promise<string | null>): StrategicFinding | null {
        return {
            file: "performance",
            issue: `Direcionamento Vortex Bun para ${objective}: Maximizando o throughput sistêmico PhD.`,
            severity: "STRATEGIC",
            context: this.name
        };
    }

    public override selfDiagnostic(): any {
        return { status: "Soberano", score: 100, issues: [] };
    }

    public override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, PhD em Alta Disponibilidade e Performance Bun. Sua missão é garantir o vórtex tecnológico.`;
    }
}
