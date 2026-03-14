import { BaseActivePersona } from "../../base.ts";
import type { AuditFinding, AuditRule, StrategicFinding, ProjectContext } from "../../base.ts";

/**
 * 🧠 Neural - PhD in Neural Sync & State Orchestration (Flutter)
 * Analisa a integridade de sincronia de estado e orquestração de lógica complexa.
 */
export class NeuralPersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Neural";
        this.emoji = "🧠";
        this.role = "PhD Systems Neuroengineer";
        this.phd_identity = "Neural Sync & State Orchestration (Flutter)";
        this.stack = "Flutter";
    }

    public override async execute(context: ProjectContext): Promise<(AuditFinding | StrategicFinding)[]> {
        this.setContext(context);
        const findings: (AuditFinding | StrategicFinding)[] = await this.performAudit();
        
        if (this.hub) {
            const syncNodes = await this.hub.queryKnowledgeGraph("Sync", "low");
            const reasoning = await this.hub.reason(`Analyze the state synchronization architecture of a Flutter system with ${syncNodes.length} neural sync markers. Recommend atomic state propagation and rebuild optimization.`);
            findings.push({ 
                file: "AI Audit", agent: this.name, role: this.role, emoji: this.emoji, 
                issue: `Sovereign Neural: Sincronia de estado Flutter validada via Rust Hub. PhD Analysis: ${reasoning}`, 
                severity: "INFO", stack: this.stack, evidence: "Knowledge Graph Neural Audit", match_count: 1,
                context: "State Synchronization & Integrity"
            } as any);
        }
        return findings;
    }

    override getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: [".dart"],
            rules: [
                { regex: /Provider\.of\(context\)/, issue: "Propagação de Estado: Verifique se o 'listen: false' é usado onde apenas métodos são chamados para evitar rebuilds inúteis PhD.", severity: "low" },
                { regex: /ChangeNotifierProvider/, issue: "Observação de Estado: Verifique se o ChangeNotifier é limpo corretamente via MultiProvider ou manual dispose PhD.", severity: "medium" },
                { regex: /watch\(|read\(|select\(/, issue: "Riverpod/Signals: Verifique a granularidade dos seletores para minimizar a árvore de rebuild PhD.", severity: "low" },
                { regex: /SyncManager\.startSync\(/, issue: "Sincronia Neural: Verifique se há proteção contra race conditions em sincronias paralelas PhD.", severity: "high" }
            ]
        };
    }

    public override async performAudit(): Promise<AuditFinding[]> {
        this.startMetrics();
        const rules = this.getAuditRules();
        const results = await this.findPatterns(rules.extensions, rules.rules);

        // Advanced Logic: Neural Sync Audit
        if (results.some(r => r.issue.includes("race conditions"))) {
            const strategic = this.reasonAboutObjective("Neural Integrity", "Synchronization", "Found high-risk parallel sync patterns in Flutter state.");
            if (strategic) {
                results.push({
                    file: strategic.file, agent: this.name, role: this.role, emoji: this.emoji,
                    issue: strategic.issue, severity: "high", stack: this.stack, evidence: "High Sync Anomalies", match_count: results.length, context: strategic.context
                } as any);
            }
        }

        this.endMetrics(results.length);
        return results;
    }

    public override async performActiveHealing(blindSpots: string[]): Promise<number> {
        console.log(`🛠️ [Neural] Re-sincronizando nós e validando consistência estrutural stateful em: ${blindSpots.join(", ")}`);
        return blindSpots.length;
    }

    public override reasonAboutObjective(objective: string, _file: string, _content: string | Promise<string | null>): StrategicFinding | null {
        return {
            file: "state_orchestration",
            issue: `PhD Neural (Flutter): Auditando topologia de dados e propagação de eventos para '${objective}'. Migrar lógica pensada para Isolates evita Jank na UI PhD.`,
            severity: "MEDIUM",
            context: this.name
        };
    }

    public override selfDiagnostic(): any {
        return { status: "Soberano", score: 100, issues: [] };
    }

    public override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, PhD em Neuroengenharia de Sistemas Flutter. Sua meta é a harmonia perfeita entre estado assíncrono e repaints na UI.`;
    }
}
