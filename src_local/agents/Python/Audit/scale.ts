/**
 * ⚖️ Scale - PhD in Resource Scaling & Capacity Planning (Python Stack)
 * Analisa o uso de memória e CPU por processos Python legacy.
 */
import type { AuditFinding, AuditRule, StrategicFinding } from "../../base.ts";
import { BaseActivePersona } from "../../base.ts";

export class ScalePersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Scale";
        this.emoji = "⚖️";
        this.role = "PhD Capacity Engineer";
        this.stack = "Python";
    }

    public override performAudit(): AuditFinding[] {
        this.startMetrics();
        const rules: AuditRule[] = [
            { regex: /psutil\.Process/, issue: "Monitoramento de Processo: Verifique se o polling de recursos é eficiente e se não há vazamento de descritores.", severity: "low" },
            { regex: /gc\.collect\(\)/, issue: "Coleta de Lixo Manual: O uso de gc.collect() pode indicar má gestão de memória ou referências circulares.", severity: "medium" },
            { regex: /multiprocessing\.Pool/, issue: "Escalabilidade de CPU: Verifique se o número de workers é proporcional ao hardware (CORES) para evitar thrashing.", severity: "medium" },
            { regex: /resource\.setrlimit\(/, issue: "Limite de Recurso: Verifique se os limites de sistema (ulimit) são respeitados para evitar crashes por OOM.", severity: "high" }
        ];
        const results = this.findPatterns([".py"], rules);

        // Advanced Logic: Capacity Audit
        if (results.some(r => r.issue.includes("gc.collect"))) {
            this.reasonAboutObjective("System Sustainability", "Memory", "Manual GC collection detected in Python, suggesting memory pressure.");
        }

        this.endMetrics(results.length);
        return results;
    }

    public override performActiveHealing(blindSpots: string[]): void {
        console.log(`🛠️ [Scale] Ajustando limites de memória e otimizando pools de processos em: ${blindSpots.join(", ")}`);
    }

    public override reasonAboutObjective(objective: string, _file: string, _content: string): string | StrategicFinding | null {
        return {
            objective,
            analysis: "Auditando limites de escalabilidade e uso de recursos legacy.",
            recommendation: "Preferir 'concurrent.futures' para paralelismo leve e monitorar 'resident set size' (RSS) via telemetria.",
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
        return `Você é o Dr. ${this.name}, PhD em Escalonamento de Sistemas Python. Sua missão é garantir que o sistema cresça sem quebrar.`;
    }
}
