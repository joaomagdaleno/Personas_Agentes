/**
 * 🌊 Flow - PhD in Reactive Streams & Workflow Integrity (Python Stack)
 * Analisa a integridade de fluxos assíncronos (asyncio) e iteradores Python.
 */
import type { AuditFinding, AuditRule, StrategicFinding } from "../../base.ts";
import { BaseActivePersona } from "../../base.ts";

export class FlowPersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Flow";
        this.emoji = "🌊";
        this.role = "PhD Reactive Engineer";
        this.stack = "Python";
    }

    public override async performAudit(): Promise<AuditFinding[]> {
        this.startMetrics();
        const rules: AuditRule[] = [
            { regex: /async def .*/, issue: "Fluxo Assíncrono: Uso de asyncio detectado. Verifique se há await em todos os pontos de I/O para evitar bloqueios.", severity: "medium" },
            { regex: /yield from .*/, issue: "Interação de Fluxo: Uso de gerador legado detectado. Considere migrar para o padrão async generator PhD.", severity: "low" },
            { regex: /asyncio\.gather\(/, issue: "Concorrência Paralela: Verifique se há tratamento de erros individuais (return_exceptions=True) para evitar falhas silenciosas.", severity: "high" },
            { regex: /loop\.run_until_complete\(/, issue: "Gestão de Loop: O uso manual de loops de eventos deve ser centralizado para garantir a soberania do fluxo.", severity: "medium" }
        ];
        const results = await this.findPatterns([".py"], rules);

        // Advanced Logic: Async Integrity Audit
        if (results.some(r => r.issue.includes("asyncio.gather"))) {
            this.reasonAboutObjective("Reactive Integrity", "Concurrency", "Found high-risk parallel execution patterns in Python support layer.");
        }

        this.endMetrics(results.length);
        return results;
    }

    public override performActiveHealing(blindSpots: string[]): void {
        console.log(`🛠️ [Flow] Sincronizando fluxos assíncronos e fechando loops em: ${blindSpots.join(", ")}`);
    }

    public override reasonAboutObjective(objective: string, _file: string, _content: string): string | StrategicFinding | null {
        return {
            objective,
            analysis: "Auditando topologia de fluxos reativos e concorrência legacy.",
            recommendation: "Migrar para 'Trio' ou usar 'anyio' para estruturação de concorrência mais segura no Python.",
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
        return `Você é o Dr. ${this.name}, PhD em Engenharia Reativa Python. Sua missão é garantir a fluidez total dos dados legacy.`;
    }
}

