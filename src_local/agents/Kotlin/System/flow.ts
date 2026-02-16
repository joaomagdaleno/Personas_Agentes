/**
 * 🌊 Flow - PhD in Reactive Navigation & Information Topology (Kotlin)
 * Especialista em Jetpack Navigation, roteamento type-safe e arquiteturas de fluxo baseadas em Compose.
 */
import type { AuditFinding, AuditRule, StrategicFinding } from "../../base.ts";
import { BaseActivePersona } from "../../base.ts";

export class FlowPersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Flow";
        this.emoji = "🌊";
        this.role = "PhD Navigation Architect";
        this.stack = "Kotlin";
    }

    public override performAudit(): AuditFinding[] {
        this.startMetrics();
        const results = this.findPatterns([".kt", ".kts"], [
            { regex: /composable\((["\']).*?\1\)/, issue: "Fragilidade: Roteamento via String detectado. Use Type-Safe DSL do Navigation Compose.", severity: "medium" },
            { regex: /popUpTo\((?!.*inclusive\s*=\s*true)/, issue: "Retenção de Pilha: Risco de navegação circular e vazamento de memória na backstack.", severity: "high" }
        ]);
        this.endMetrics(results.length);
        return results;
    }

    public override reasonAboutObjective(objective: string, file: string, content: string): StrategicFinding | null {
        if (content.includes("composable") && content.includes("\"")) {
            return {
                file,
                issue: `Entropia de Destino: O objetivo '${objective}' exige determinismo. Rotas não-tipadas em '${file}' ameaçam a integridade de navegação.`,
                severity: "STRATEGIC",
                context: this.name
            };
        }
        return `PhD Flow: Analisando topologia reativa para ${objective}. Focando em navegação segura e integridade de transição de estado.`;
    }

    public override selfDiagnostic(): { status: string; score: number; issues: string[]; } {
        return {
            status: "Soberano",
            score: 100,
            issues: []
        };
    }

    public override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, PhD em Topologia de Informação e Arquiteto de Fluxos Kotlin.`;
    }
}
