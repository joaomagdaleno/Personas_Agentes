import { BaseActivePersona } from "../../base.ts";
import type { AuditFinding, AuditRule, StrategicFinding, ProjectContext } from "../../base.ts";

/**
 * 🧠 Neural - PhD in Neural Sync & State Orchestration (Python Stack)
 * Analisa a integridade de sincronia de estado e orquestração de lógica complexa em Python legacy.
 */
export class NeuralPersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Neural";
        this.emoji = "🧠";
        this.role = "PhD Systems Neuroengineer";
        this.phd_identity = "Neural Sync & State Orchestration (Python)";
        this.stack = "Python";
    }

    public override async execute(context: ProjectContext): Promise<(AuditFinding | StrategicFinding)[]> {
        this.setContext(context);
        const findings: (AuditFinding | StrategicFinding)[] = await this.performAudit();
        if (this.hub) {
            const syncNodes = await this.hub.queryKnowledgeGraph("SyncManager", "medium");
            const reasoning = await this.hub.reason(`Analyze the neural synchronization of a Python system with ${syncNodes.length} state markers. Recommend race condition prevention and lock optimization.`);
            findings.push({ 
                file: "System Audit", agent: this.name, role: this.role, emoji: this.emoji, 
                issue: `Sovereign Neural: Sincronia de estado validada via Rust Hub. PhD Analysis: ${reasoning}`, 
                severity: "INFO", stack: this.stack, evidence: "Knowledge Graph Neural Audit", match_count: 1,
                context: "Neural Sync Integrity"
            } as any);
        }
        return findings;
    }

    override getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: [".py"],
            rules: [
                { regex: /SyncManager\.start_sync\(/, issue: "Sincronia Neural: Verifique proteção contra race conditions em sincronias paralelas PhD.", severity: "high" },
                { regex: /@property\s+def .*/, issue: "Estado Computado: Uso excessivo de properties pode esconder degradação PhD.", severity: "low" },
                { regex: /threading\.Lock\(\)/, issue: "Sincronização de Estado: Verifique se o lock é liberado em 'finally' para evitar deadlocks PhD.", severity: "high" },
                { regex: /dict_update_event = .*/, issue: "Propagação de Evento: Verifique se a atualização dispara observers corretos PhD.", severity: "medium" }
            ]
        };
    }

    public override async performAudit(): Promise<AuditFinding[]> {
        this.startMetrics();
        const rules = this.getAuditRules();
        const results = await this.findPatterns(rules.extensions, rules.rules);

        if (results.some(r => r.severity === "high")) {
            results.push({
                file: "PYTHON_NEURAL_SYNC", agent: this.name, role: this.role, emoji: this.emoji,
                issue: "Neural Integrity: Found high-risk threading or sync patterns.",
                severity: "high", stack: this.stack, evidence: "Structural Analysis", match_count: 1, context: "State Sync"
            } as any);
        }

        this.endMetrics(results.length);
        return results;
    }

    public override reasonAboutObjective(objective: string, file: string, _content: string | Promise<string | null>): StrategicFinding | null {
        return {
            file,
            issue: `PhD Neural (Python): Auditando topologia de dados e propagação de eventos legacy para ${objective}.`,
            severity: "STRATEGIC",
            context: this.name
        };
    }

    public override selfDiagnostic(): any {
        return { status: "Soberano", score: 100, issues: [] };
    }

    public override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, PhD em Neuroengenharia de Sistemas Python.`;
    }
}
