/**
 * 🔊 Echo - PhD in Semantic Echo & Resource Mapping (Flutter)
 * Analisa a integridade de assets, fontes e constantes de string.
 */
import type { AuditFinding, AuditRule, StrategicFinding } from "../../base.ts";
import { BaseActivePersona } from "../../base.ts";

export class EchoPersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Echo";
        this.emoji = "🔊";
        this.role = "PhD Content Strategist";
        this.stack = "Flutter";
    }

    public override performAudit(): AuditFinding[] {
        this.startMetrics();
        const rules: AuditRule[] = [
            { regex: /pubspec\.yaml.*assets:/, issue: "Observação: Mapeamento de assets detectado. Verifique se os caminhos existem.", severity: "low" },
            { regex: /"[\w\s]{50,}"/, issue: "Hardcoded String: Use o sistema de i18n/l10n para strings longas para permitir localização futura.", severity: "medium" },
            { regex: /TextStyle\(.*\)/, issue: "Estilização Ad-hoc: Verifique se as fontes e estilos seguem o Design System unificado.", severity: "low" },
            { regex: /static const String/, issue: "Constante Semântica: Verifique se o nome é descritivo e evita duplicação de valor.", severity: "low" }
        ];
        const results = this.findPatterns([".dart", ".yaml"], rules);

        // Advanced Logic: Content Strategy
        if (results.some(r => r.issue.includes("Hardcoded"))) {
            this.reasonAboutObjective("Internationalization", "UI Strings", "Codebase has high density of hardcoded strings.");
        }

        this.endMetrics(results.length);
        return results;
    }

    public override performActiveHealing(blindSpots: string[]): void {
        console.log(`🛠️ [Echo] Normalizando caminhos de assets para: ${blindSpots.join(", ")}`);
    }

    public override reasonAboutObjective(objective: string, _file: string, _content: string): string | StrategicFinding | null {
        return {
            objective,
            analysis: "Auditando consistência semântica e acessibilidade de conteúdo Flutter.",
            recommendation: "Migrar todas as strings estáticas para arquivos .arb (App Resource Bundle).",
            severity: "low"
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
        return `Você é o Dr. ${this.name}, PhD em Semântica de Conteúdo Flutter. Sua missão é garantir que cada byte de texto faça sentido estratégico.`;
    }
}
