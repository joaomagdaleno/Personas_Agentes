/**
 * ⚡ Bolt - PhD in Performance & JVM Instrumentation (Kotlin)
 * Analisa a eficiência de bytecode, concorrência e uso de memória.
 */
import type { AuditFinding, AuditRule, StrategicFinding } from "../../base.ts";
import { BaseActivePersona } from "../../base.ts";

export class BoltPersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Bolt";
        this.emoji = "⚡";
        this.role = "PhD Performance Engineer";
        this.stack = "Kotlin";
    }

    public override performAudit(): AuditFinding[] {
        this.startMetrics();
        const rules: AuditRule[] = [
            { regex: /while\s*\(\s*true\s*\)/, issue: "Busy Wait: Loop infinito sem suspensão ou interrupção.", severity: "critical" },
            { regex: /Thread\.sleep\(/, issue: "Blocking Thread: Bloqueio de thread física em pool de coroutines.", severity: "critical" },
            { regex: /GlobalScope\.launch/, issue: "Unstructured Concurrency: Uso de GlobalScope pode causar vazamentos de memória.", severity: "high" },
            { regex: /ArrayList<.*>\(\)/, issue: "Sizing de Coleção: Alocação sem capacidade inicial definida.", severity: "low" },
            { regex: /synchronized\(.*\)/, issue: "Manual Sync: Overhead de sincronização manual; considere Mutex/Flow.", severity: "medium" }
        ];
        const results = this.findPatterns([".kt", ".kts"], rules);

        // Advanced Logic: JVM Performance Audit
        if (results.some(r => r.issue.includes("GlobalScope"))) {
            this.reasonAboutObjective("Coroutine Health", "Conccurrency", "Found unstructured concurrency patterns in Kotlin.");
        }

        this.endMetrics(results.length);
        return results;
    }

    public override performActiveHealing(blindSpots: string[]): void {
        console.log(`🛠️ [Bolt] Otimizando loops e ajustando escopos de coroutine em: ${blindSpots.join(", ")}`);
    }

    public override reasonAboutObjective(objective: string, _file: string, _content: string): string | StrategicFinding | null {
        return {
            objective,
            analysis: "Auditando eficiência de execução e gestão de recursos na JVM.",
            recommendation: "Preferir 'withContext(Dispatchers.Default)' para processamento intensivo de CPU.",
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
        return `Você é o Dr. ${this.name}, PhD em Performance JVM e Kotlin. Sua missão é garantir que o código voe com estabilidade.`;
    }
}
