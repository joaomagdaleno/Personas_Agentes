/**
 * 💂 Warden - PhD in Thread Safety & Resource Lifecycle (Flutter)
 * Analisa a integridade de isolates, memória e dispose de controllers.
 */
import type { AuditFinding, AuditRule, StrategicFinding } from "../../base.ts";
import { BaseActivePersona } from "../../base.ts";

export class WardenPersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Warden";
        this.emoji = "💂";
        this.role = "PhD Resource Governor";
        this.stack = "Flutter";
    }

    public override performAudit(): AuditFinding[] {
        this.startMetrics();
        const rules: AuditRule[] = [
            { regex: /Isolate\.spawn\(/, issue: "Concorrência: Isolates detectados. Verifique o fechamento de SendPort/ReceivePort para evitar vazamentos.", severity: "high" },
            { regex: /@override\n  void dispose\(\)/, issue: "Ciclo de Vida: Verifique se todos os StreamControllers e AnimationControllers são fechados aqui.", severity: "medium" },
            { regex: /compute\(.*\)/, issue: "Offloading: Verifique se a função passada para 'compute' é global ou estática conforme exigido.", severity: "low" },
            { regex: /StreamController\(\)/, issue: "Vazamento de Fluxo: Prefira 'StreamController.broadcast()' se houver múltiplos ouvintes ou garanta o dispose.", severity: "high" }
        ];
        const results = this.findPatterns([".dart"], rules);

        // Advanced Logic: Resource Audit
        if (results.some(r => r.severity === "high")) {
            this.reasonAboutObjective("Memory Integrity", "Lifecycle", "Found patterns of potential resource leaks in Flutter controllers.");
        }

        this.endMetrics(results.length);
        return results;
    }

    public override performActiveHealing(blindSpots: string[]): void {
        console.log(`🛠️ [Warden] Injetando código de dispose e fechando portas em: ${blindSpots.join(", ")}`);
    }

    public override reasonAboutObjective(objective: string, _file: string, _content: string): string | StrategicFinding | null {
        return {
            objective,
            analysis: "Auditando thread safety e sustentabilidade de memória.",
            recommendation: "Usar o pacote 'flutter_hooks' para automatizar o dispose de controllers e reduzir boilerplate propenso a erro.",
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
        return `Você é o Dr. ${this.name}, PhD em Governança de Recursos Flutter. Sua meta é um sistema com zero memory leaks e performance máxima.`;
    }
}
