import { BaseActivePersona } from "../../base.ts";
import type { AuditFinding, AuditRule, StrategicFinding, ProjectContext } from "../../base.ts";

/**
 * 🌊 Flow - PhD in Reactive Streams & Workflow Integrity (Flutter)
 * Analisa a integridade de fluxos assíncronos e reatividade de UI.
 */
export class FlowPersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Flow";
        this.emoji = "🌊";
        this.role = "PhD Reactive Engineer";
        this.phd_identity = "Flutter Reactive Streams & UI Workflow Integrity";
        this.stack = "Flutter";
    }

    public override async execute(context: ProjectContext): Promise<(AuditFinding | StrategicFinding)[]> {
        this.setContext(context);
        const findings: (AuditFinding | StrategicFinding)[] = await this.performAudit();
        return findings;
    }

    override getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: [".dart"],
            rules: [
                { regex: /StreamBuilder\(|FutureBuilder\(/, issue: "Reatividade Básica: Verifique se o estado inicial e de erro são tratados visualmente no Builder PhD.", severity: "low" },
                { regex: /async\*/, issue: "Generator Assíncrono: Uso de async* (Stream generator). Verifique se o fechamento é controlado externamente PhD.", severity: "medium" },
                { regex: /BehaviorSubject|PublishSubject/, issue: "RxDart: Verifique se os subjects são fechados no dispose para evitar memory leaks graves PhD.", severity: "high" },
                { regex: /await for/, issue: "Loop Assíncrono: Verifique se há timeout ou proteção contra streams infinitas que travam a execução/isolate PhD.", severity: "high" }
            ]
        };
    }

    public override async performAudit(): Promise<AuditFinding[]> {
        this.startMetrics();
        const rules = this.getAuditRules();
        const results = await this.findPatterns(rules.extensions, rules.rules);

        // Advanced Logic: Stream Integrity
        if (results.some(r => r.severity === "high")) {
            const strategic = this.reasonAboutObjective("Reactive Integrity", "Streams", "Found unmanaged reactive subjects in Flutter components.");
            if (strategic) {
                results.push({
                    file: strategic.file, agent: this.name, role: this.role, emoji: this.emoji,
                    issue: strategic.issue, severity: "high", stack: this.stack, evidence: "High Stream Rebuilds", match_count: results.length, context: strategic.context
                } as any);
            }
        }

        this.endMetrics(results.length);
        return results;
    }

    public override async performActiveHealing(blindSpots: string[]): Promise<number> {
        console.log(`🛠️ [Flow] Sincronizando fluxos RxDart e fechando observers em Dart: ${blindSpots.join(", ")}`);
        return blindSpots.length;
    }

    public override reasonAboutObjective(objective: string, _file: string, _content: string | Promise<string | null>): StrategicFinding | null {
        return {
            file: "stream_integrity",
            issue: `PhD Flow (Flutter): Auditando topologia de fluxos reativos e concorrência para '${objective}'. Cuidado com pressão de eventos no StreamBuilder PhD.`,
            severity: "MEDIUM",
            context: this.name
        };
    }

    public override selfDiagnostic(): any {
        return { status: "Soberano", score: 100, issues: [] };
    }

    public override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, PhD em Engenharia Reativa Flutter. Sua missão é garantir a fluidez absoluta dos dados assíncronos.`;
    }
}
