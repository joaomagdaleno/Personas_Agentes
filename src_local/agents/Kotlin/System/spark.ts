import { BaseActivePersona } from "../../base.ts";
import type { AuditFinding, AuditRule, StrategicFinding, ProjectContext } from "../../base.ts";

/**
 * ✨ Spark - PhD in UX Psychology & Android Delight (Kotlin)
 * Especialista em animações complexas em Compose, feedback tátil e psicologia da interface.
 */
export class SparkPersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Spark";
        this.emoji = "✨";
        this.role = "PhD Engagement Architect";
        this.phd_identity = "UX Psychology & Visual Delight (Android/Kotlin)";
        this.stack = "Kotlin";
    }

    public override async execute(context: ProjectContext): Promise<(AuditFinding | StrategicFinding)[]> {
        this.setContext(context);
        const findings: (AuditFinding | StrategicFinding)[] = await this.performAudit();
        return findings;
    }

    override getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: [".kt"],
            rules: [
                { regex: /animate.*AsState\((?!.*animationSpec)/, issue: "Movimento Padrão: Falta especificação de animação PhD (animationSpec) no Compose.", severity: "low" },
                { regex: /performHapticFeedback/, issue: "Engajamento Tátil: Feedback háptico detectado. Verifique consistência sensorial no fluxo Android PhD.", severity: "low" }
            ]
        };
    }

    public override async performAudit(): Promise<AuditFinding[]> {
        this.startMetrics();
        const rules = this.getAuditRules();
        const results = await this.findPatterns(rules.extensions, rules.rules);
        this.endMetrics(results.length);
        return results;
    }

    public override reasonAboutObjective(objective: string, file: string, content: string | Promise<string | null>): StrategicFinding | null {
        if (typeof content === 'string' && (!content.includes("animate") && content.includes("Composable") && !content.includes("rules ="))) {
            return {
                file,
                issue: `Interface Estática: O objetivo '${objective}' exige alto engajamento. Falta de feedback visual premium em '${file}' reduz a imersão na UI PhD.`,
                severity: "STRATEGIC",
                context: this.name
            };
        }
        return {
            file, severity: "INFO",
            issue: `PhD Engagement (Kotlin): Analisando elementos de deleite visual para ${objective}. Focando em micro-interações analógicas.`,
            context: this.name
        };
    }

    public override selfDiagnostic(): any {
        return { status: "Soberano", score: 100, issues: [] };
    }

    public override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, PhD em Psicologia da Interface Compose e Mestre em Deleite UX Kotlin.`;
    }
}
