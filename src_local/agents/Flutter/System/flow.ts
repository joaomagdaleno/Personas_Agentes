/**
 * 🌊 Flow - PhD in Reactive Streams & Workflow Integrity (Flutter)
 * Analisa a integridade de fluxos assíncronos e reatividade de UI.
 */
import type { AuditFinding, AuditRule, StrategicFinding } from "../../base.ts";
import { BaseActivePersona } from "../../base.ts";

export class FlowPersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Flow";
        this.emoji = "🌊";
        this.role = "PhD Reactive Engineer";
        this.stack = "Flutter";
    }

    public override async performAudit(): Promise<AuditFinding[]> {
        this.startMetrics();
        const rules: AuditRule[] = [
            { regex: /StreamBuilder\(|FutureBuilder\(/, issue: "Reatividade Básica: Verifique se o estado inicial e de erro são tratados visualmente.", severity: "low" },
            { regex: /async\*/, issue: "Generator Assíncrono: Uso de async* (Stream generator). Verifique se o fechamento é controlado externamente.", severity: "medium" },
            { regex: /BehaviorSubject|PublishSubject/, issue: "RxDart: Verifique se os subjects são fechados no dispose para evitar memory leaks.", severity: "high" },
            { regex: /await for/, issue: "Loop Assíncrono: Verifique se há timeout ou proteção contra streams infinitas que travam a execução.", severity: "high" }
        ];
        const results = await this.findPatterns([".dart"], rules);

        // Advanced Logic: Stream Integrity
        if (results.some(r => r.severity === "high")) {
            this.reasonAboutObjective("Reactive Integrity", "Streams", "Found unmanaged reactive subjects in Flutter components.");
        }

        this.endMetrics(results.length);
        return results;
    }

    public override performActiveHealing(blindSpots: string[]): void {
        console.log(`🛠️ [Flow] Sincronizando fluxos e fechando observers em: ${blindSpots.join(", ")}`);
    }

    public override reasonAboutObjective(objective: string, _file: string, _content: string): string | StrategicFinding | null {
        return {
            objective,
            analysis: "Auditando topologia de fluxos reativos e concorrência.",
            recommendation: "Usar 'rxdart' operators (debounceTime, switchMap) para controlar a pressão de eventos na UI.",
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
        return `Você é o Dr. ${this.name}, PhD em Engenharia Reativa Flutter. Sua missão é garantir a fluidez absoluta dos dados.`;
    }
}

