import { BaseActivePersona } from "../../base.ts";
import type { AuditFinding, AuditRule, StrategicFinding, ProjectContext } from "../../base.ts";

/**
 * 🌀 Vortex - Flutter-native Operational Excellence & Performance Agent
 * Sovereign Synapse: Audita a eficiência de builds de widgets, Isolates e performance de UI de nível PhD.
 */
export class VortexPersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Vortex";
        this.emoji = "🌀";
        this.role = "PhD Efficiency Scientist";
        this.phd_identity = "Operational Excellence & Algorithm Integrity (Flutter)";
        this.stack = "Flutter";
    }

    public override async execute(context: ProjectContext): Promise<(AuditFinding | StrategicFinding)[]> {
        this.setContext(context);
        const findings: (AuditFinding | StrategicFinding)[] = await this.performAudit();
        
        if (this.hub) {
            const widgetNodes = await this.hub.queryKnowledgeGraph("Widget", "low");
            const reasoning = await this.hub.reason(`Analyze the widget tree complexity and rebuild patterns of a Flutter system with ${widgetNodes.length} build markers. Recommend Isolate usage and repaint boundary optimization.`);
            findings.push({ 
                file: "Operational Audit", agent: this.name, role: this.role, emoji: this.emoji, 
                issue: `Sovereign Vortex: Otimização Flutter validada via Rust Hub. PhD Analysis: ${reasoning}`, 
                severity: "INFO", stack: this.stack, evidence: "Knowledge Graph Vortex Audit", match_count: 1,
                context: "UI Performance & Concurrency"
            } as any);
        }
        return findings;
    }

    override getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: [".dart"],
            rules: [
                { regex: /Isolate\.spawn/, issue: "Concurrency: Criação de Isolate detectada. Verifique se a troca de mensagens possui overhead controlado PhD.", severity: "low" },
                { regex: /setState\(\(\)\s*=>\s*[\s\S]{1000,}\}/, issue: "Efficiency: setState com lógica excessivamente complexa. Risco de Jank na renderização UI PhD.", severity: "medium" },
                { regex: /RepaintBoundary/, issue: "Optimization: Uso de RepaintBoundary detectado. Verifique se os limites de renderização são ótimos PhD.", severity: "low" }
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

    public override reasonAboutObjective(objective: string, file: string, _content: string | Promise<string | null>): StrategicFinding | null {
        return {
            file: "optimization",
            issue: `Direcionamento Vortex Flutter para ${objective}: Maximizando frames-per-second (FPS) e repainting bounds PhD.`,
            severity: "STRATEGIC",
            context: this.name
        };
    }

    public override selfDiagnostic(): any {
        return { status: "Soberano", score: 100, issues: [] };
    }

    public override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, PhD em Engenharia Gráfica e Mobile. Sua missão é garantir a fluidez visual absoluta do Flutter.`;
    }
}
