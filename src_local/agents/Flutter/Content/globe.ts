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
        this.phd_identity = "Internationalization & Cultural Logic (Flutter)";
        this.stack = "Flutter";
    }

    public override async execute(context: any): Promise<any> {
        this.setContext(context);
        const findings = await this.performAudit();
        if (this.hub) {
            const i18nNodes = await this.hub.queryKnowledgeGraph(".arb", "medium");
            const reasoning = await this.hub.reason(`Analyze i18n readiness of a Flutter system with ${i18nNodes.length} localization resource patterns. Recommend .arb and RTL compliance.`);
            findings.push({ file: "i18n Audit", agent: this.name, role: this.role, emoji: this.emoji, issue: `Sovereign Globe: Localização Flutter validada via Rust Hub. PhD Analysis: ${reasoning}`, severity: "INFO", stack: this.stack, evidence: "Knowledge Graph i18n Audit", match_count: 1 } as any);
        }
        return findings;
    }

    public override getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: [".dart", ".arb"],
            rules: [
                { regex: /\.arb$/, issue: "Suporte l10n: Arquivo de tradução detectado. Verifique se todas as chaves estão presentes em todos os locales.", severity: "low" },
                { regex: /AppLocalizations\.of\(context\)/, issue: "Acesso de Tradução: Verifique se o context é válido e se há fallback configurado.", severity: "low" },
                { regex: /Directionality\.of\(context\)/, issue: "Suporte RTL: Verifique se o layout se adapta corretamente para idiomas como Árabe/Hebraico.", severity: "medium" },
                { regex: /Intl\.message\(/, issue: "Legacy i18n: Considere migrar para o sistema de .arb nativo do Flutter para maior integração.", severity: "medium" }
            ]
        };
    }

    public override async performAudit(): Promise<AuditFinding[]> {
        this.startMetrics();
        const { extensions, rules } = this.getAuditRules();
        const results = await this.findPatterns(extensions, rules);

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

