/**
 * ✨ Spark - PhD in UX Psychology & Android Delight (Kotlin)
 * Especialista em animações complexas em Compose, feedback tátil e psicologia da interface.
 */
import type { AuditFinding, AuditRule, StrategicFinding } from "../../base.ts";
import { BaseActivePersona } from "../../base.ts";

export class SparkPersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Spark";
        this.emoji = "✨";
        this.role = "PhD Engagement Architect";
        this.stack = "Kotlin";
    }

    public override async performAudit(): Promise<AuditFinding[]> {
        this.startMetrics();
        const results = await this.findPatterns([".kt"], [
            { regex: /animate.*AsState\((?!.*animationSpec)/, issue: "Movimento Padrão: Falta especificação de animação PhD (animationSpec).", severity: "low" },
            { regex: /performHapticFeedback/, issue: "Engajamento Tátil: Feedback háptico detectado. Verifique consistência sensorial.", severity: "low" }
        ]);
        this.endMetrics(results.length);
        return results;
    }

    public override reasonAboutObjective(objective: string, file: string, content: string): StrategicFinding | null {
        if (!content.includes("animate") && content.includes("Composable") && !content.includes("rules =")) {
            return {
                file,
                issue: `Interface Estática: O objetivo '${objective}' exige alto engajamento. Falta de feedback visual premium em '${file}' reduz a imersão.`,
                severity: "STRATEGIC",
                context: this.name
            };
        }
        return `PhD Engagement: Analisando elementos de deleite visual para ${objective}. Focando em micro-interações e feedback tátil.`;
    }

    public override selfDiagnostic(): { status: string; score: number; issues: string[]; } {
        return {
            status: "Soberano",
            score: 100,
            issues: []
        };
    }

    public override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, PhD em Psicologia da Interface e Mestre em Deleite UX Kotlin.`;
    }
}

