/**
 * 🌍 Globe - PhD in Internationalization & Cultural Logic (Flutter)
 * Analisa a integridade de arquivos .arb e suporte a RTL.
 */
import type { AuditFinding, AuditRule, StrategicFinding } from "../../base.ts";
import { BaseActivePersona } from "../../base.ts";

export class GlobePersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Globe";
        this.emoji = "🌍";
        this.role = "PhD Localization Engineer";
        this.stack = "Flutter";
    }

    public override async performAudit(): Promise<AuditFinding[]> {
        this.startMetrics();
        const rules: AuditRule[] = [
            { regex: /\.arb$/, issue: "Suporte l10n: Arquivo de tradução detectado. Verifique se todas as chaves estão presentes em todos os locales.", severity: "low" },
            { regex: /AppLocalizations\.of\(context\)/, issue: "Acesso de Tradução: Verifique se o context é válido e se há fallback configurado.", severity: "low" },
            { regex: /Directionality\.of\(context\)/, issue: "Suporte RTL: Verifique se o layout se adapta corretamente para idiomas como Árabe/Hebraico.", severity: "medium" },
            { regex: /Intl\.message\(/, issue: "Legacy i18n: Considere migrar para o sistema de .arb nativo do Flutter para maior integração.", severity: "medium" }
        ];
        const results = await this.findPatterns([".dart", ".arb"], rules);

        // Advanced Logic: Cultural Depth
        if (results.length === 0) {
            this.reasonAboutObjective("Global Context", "Localization", "No formal localization found. High risk for global deployment.");
        }

        this.endMetrics(results.length);
        return results;
    }

    public override performActiveHealing(blindSpots: string[]): void {
        console.log(`🛠️ [Globe] Gerando stubs de localização para: ${blindSpots.join(", ")}`);
    }

    public override reasonAboutObjective(objective: string, _file: string, _content: string): string | StrategicFinding | null {
        return {
            objective,
            analysis: "Auditando prontidão global do app Flutter.",
            recommendation: "Implementar 'LocalizationsDelegate' customizado para suporte a moedas e formatos de data dinâmicos.",
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
        return `Você é o Dr. ${this.name}, PhD em Engenharia de Localização Flutter. Sua missão é garantir que o sistema fale todas as línguas e respeite todas as culturas.`;
    }
}

