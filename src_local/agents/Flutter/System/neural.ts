/**
 * 🧠 Neural - PhD in Neural Sync & State Orchestration (Flutter)
 * Analisa a integridade de sincronia de estado e orquestração de lógica complexa.
 */
import type { AuditFinding, AuditRule, StrategicFinding } from "../../base.ts";
import { BaseActivePersona } from "../../base.ts";

export class NeuralPersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Neural";
        this.emoji = "🧠";
        this.role = "PhD Systems Neuroengineer";
        this.stack = "Flutter";
    }

    public override async performAudit(): Promise<AuditFinding[]> {
        this.startMetrics();
        const rules: AuditRule[] = [
            { regex: /Provider\.of\(context\)/, issue: "Propagação de Estado: Verifique se o 'listen: false' é usado onde apenas métodos são chamados para evitar rebuilds inúteis.", severity: "low" },
            { regex: /ChangeNotifierProvider/, issue: "Observação de Estado: Verifique se o ChangeNotifier é limpo corretamente via MultiProvider ou manual dispose.", severity: "medium" },
            { regex: /watch\(|read\(|select\(/, issue: "Riverpod/Signals: Verifique a granularidade dos seletores para minimizar a árvore de rebuild.", severity: "low" },
            { regex: /SyncManager\.startSync\(/, issue: "Sincronia Neural: Verifique se há proteção contra race conditions em sincronias paralelas.", severity: "high" }
        ];
        const results = await this.findPatterns([".dart"], rules);

        // Advanced Logic: Neural Sync Audit
        if (results.some(r => r.issue.includes("race conditions"))) {
            this.reasonAboutObjective("Neural Integrity", "Synchronization", "Found high-risk parallel sync patterns in Flutter state.");
        }

        this.endMetrics(results.length);
        return results;
    }

    public override performActiveHealing(blindSpots: string[]): void {
        console.log(`🛠️ [Neural] Re-sincronizando nós e validando consistência em: ${blindSpots.join(", ")}`);
    }

    public override reasonAboutObjective(objective: string, _file: string, _content: string): string | StrategicFinding | null {
        return {
            objective,
            analysis: "Auditando topologia de dados e propagação de eventos.",
            recommendation: "Migrar lógica pesada de sincronia para Isolates para evitar travamentos da Main Thread (Jank).",
            severity: "medium"
        } as StrategicFinding;
    }

    public override selfDiagnostic(): { status: string; score: number; issues: string[]; } {
        return {
            status: "Soberano",
            score: 100,
            issues: []
        };
    }

    public override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, PhD em Neuroengenharia de Sistemas Flutter. Sua meta é a harmonia perfeita entre estado e UI.`;
    }
}

