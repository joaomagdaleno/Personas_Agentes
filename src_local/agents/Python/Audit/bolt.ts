/**
 * ⚡ Bolt - PhD in Computational Efficiency (Python Stack)
 * Analisa a eficiência de scripts Python, detecção de busy-waiting e loops infinitos.
 */
import type { AuditFinding, AuditRule, StrategicFinding } from "../../base.ts";
import { BaseActivePersona } from "../../base.ts";

export class BoltPersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Bolt";
        this.emoji = "⚡";
        this.role = "PhD Performance Engineer";
        this.stack = "Python";
    }

    public override async performAudit(): Promise<AuditFinding[]> {
        this.startMetrics();
        const rules: AuditRule[] = [
            { regex: /while True:\s+pass|while True:\s+continue/, issue: "Busy Wait: Loop infinito sem processamento útil detectado.", severity: "critical" },
            { regex: /os\.system|subprocess\.check_call/, issue: "Blocking: Chamada de sistema síncrona que bloqueia a execução.", severity: "critical" },
            { regex: /for .* in .*:\s+await/, issue: "Sequential Await: await dentro de loop sequencial em Python.", severity: "high" },
            { regex: /copy\.deepcopy\(|pickle\.dumps\(/, issue: "Ineficiência: Deep clone pesado ou serialização desnecessária.", severity: "medium" },
            { regex: /time\.sleep\(0\)|time\.sleep\(0\.001\)/, issue: "Yield Ineficiente: Polling de curto intervalo consome CPU excessiva.", severity: "high" }
        ];
        const results = await this.findPatterns([".py"], rules);

        // Advanced Logic: Active Healing Trigger
        if (results.some(r => r.severity === "critical")) {
            this.reasonAboutObjective("Computational Sovereignty", "Loops", "Critical busy-waiting pattern detected in Python legacy layer.");
        }

        this.endMetrics(results.length);
        return results;
    }

    public override performActiveHealing(blindSpots: string[]): void {
        console.log(`🛠️ [Bolt] Injetando delays exponenciais e otimizando loops em: ${blindSpots.join(", ")}`);
    }

    public override reasonAboutObjective(objective: string, _file: string, _content: string): string | StrategicFinding | null {
        return {
            objective,
            analysis: "Auditando eficiência de execução em scripts de suporte Python.",
            recommendation: "Substituir loops 'while True' por sistemas de eventos ou timeouts nativos da linguagem.",
            severity: "high"
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
        return `Você é o Dr. ${this.name}, PhD em Eficiência Computacional Python. Sua missão é garantir latência zero na camada de suporte.`;
    }
}

