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
            { regex: /while\s*\(true\)\s*\{\s*\}/, issue: "Gargalo: Busy-waiting detectado em Dart.", severity: "critical" },
            { regex: /sleep\(/, issue: "Risco: Uso de sleep bloqueia a UI Thread do Flutter.", severity: "high" },
            { regex: /for\s*\(var\s+i\s*=\s*0;\s*i\s*<\s*.*\.length;\s*i\+\+\)/, issue: "Otimização: Prefira .map() ou .forEach() para iteráveis em Dart.", severity: "low" }
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
