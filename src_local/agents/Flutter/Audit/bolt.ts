/**
 * ⚡ Bolt - PhD in Computational Efficiency (Flutter)
 * Especialista em detecção de frames perdidos e loops bloqueantes em Dart.
 */
import { BaseActivePersona } from "../../base.ts";
import type { AuditFinding, AuditRule, StrategicFinding } from "../../base.ts";

export class BoltPersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Bolt";
        this.emoji = "⚡";
        this.role = "PhD Performance Engineer";
        this.stack = "Flutter";
    }

    performAudit(): AuditFinding[] {
        const rules: AuditRule[] = [
            { regex: /while\s*\(true\)\s*\{\s*\}/, issue: "Busy Wait: Loop infinito sem processamento assíncrono detectado.", severity: "critical" },
            { regex: /sleep\(/, issue: "Blocking: Uso de sleep() bloqueia a Main Thread do Flutter.", severity: "critical" },
            { regex: /for\s*\(.*;.*;.*\)\s*\{[^}]*await/, issue: "Sequential Await: await dentro de loop sequencial bloqueia a UI.", severity: "high" },
            { regex: /jsonDecode\(jsonEncode/, issue: "Ineficiência: Deep clone pesado via JSON roundtrip.", severity: "medium" },
            { regex: /\.forEach\(async/, issue: "Async Trap: forEach com async não aguarda execução em Dart.", severity: "high" }
        ];
        this.startMetrics();
        const results = this.findPatterns([".dart"], rules);
        this.endMetrics(results.length);
        return results;
    }

    reasonAboutObjective(objective: string, file: string, content: string): StrategicFinding | null {
        if (content.includes("sleep(")) {
            return {
                file,
                issue: `Degradação de UX: O objetivo '${objective}' exige fluidez. Em '${file}', o uso de sleep() trava a Main Thread, impedindo a 'Orquestração de Inteligência Artificial' de manter 60fps.`,
                severity: "STRATEGIC",
                context: this.name
            };
        }
        return null;
    }

    /**
     * 🧠 Auto-diagnóstico: Verifica a própria saúde performática.
     */
    public override selfDiagnostic() {
        const diag = super.selfDiagnostic();
        if (this.stack !== "Flutter") diag.issues.push("Inconsistent tech stack.");
        return diag;
    }

    getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, mestre em performance Flutter. Sua missão é garantir zero jank.`;
    }
}
