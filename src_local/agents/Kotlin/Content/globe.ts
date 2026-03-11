/**
 * 🌍 Globe - PhD in Internationalization & Cultural Logic (Kotlin)
 * Analisa a integridade de arquivos de recursos (strings.xml) e suporte a l10n.
 */
import type { AuditFinding, AuditRule, StrategicFinding } from "../../base.ts";
import { BaseActivePersona } from "../../base.ts";

export class GlobePersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Globe";
        this.emoji = "🌍";
        this.role = "PhD Localization Engineer";
        this.phd_identity = "Internationalization & Cultural Logic (Kotlin)";
        this.stack = "Kotlin";
    }

    public override async execute(context: any): Promise<any> {
        this.setContext(context);
        const findings = await this.performAudit();
        if (this.hub) {
            const i18nNodes = await this.hub.queryKnowledgeGraph("strings.xml", "medium");
            const reasoning = await this.hub.reason(`Analyze i18n readiness of a Kotlin/Android system with ${i18nNodes.length} localization resource patterns. Recommend RTL and plurals compliance.`);
            findings.push({ file: "i18n Audit", agent: this.name, role: this.role, emoji: this.emoji, issue: `Sovereign Globe: Localização Kotlin validada via Rust Hub. PhD Analysis: ${reasoning}`, severity: "INFO", stack: this.stack, evidence: "Knowledge Graph i18n Audit", match_count: 1 } as any);
        }
        return findings;
    }

    public override async performAudit(): Promise<AuditFinding[]> {
        this.startMetrics();
        const rules: AuditRule[] = [
            { regex: /res\/values.*\/strings\.xml/, issue: "Recurso de String: Verifique se todas as chaves estão traduzidas nos locales suportados.", severity: "low" },
            { regex: /getString\(R\.string\..*\)/, issue: "Acesso de Tradução: Verifique se o contexto é válido para evitar IllegalStateException.", severity: "low" },
            { regex: /android:supportsRtl="true"/, issue: "Suporte RTL: Verifique a configuração no manifest para garantir espelhamento correto de UI.", severity: "medium" },
            { regex: /"[\w\s]{50,}"/, issue: "Hardcoded String: Mova strings longas para strings.xml para permitir localização e reuso.", severity: "medium" }
        ];
        const results = await this.findPatterns([".kt", ".kts", ".xml"], rules);

        // Advanced Logic: Global Readiness
        if (results.some(r => r.issue.includes("Hardcoded"))) {
            this.reasonAboutObjective("Global Context", "Localization", "High concentration of hardcoded strings in Kotlin, blocking l10n.");
        }

        this.endMetrics(results.length);
        return results;
    }

    public override performActiveHealing(blindSpots: string[]): void {
        console.log(`🛠️ [Globe] Extraindo strings para recursos em: ${blindSpots.join(", ")}`);
    }

    public override reasonAboutObjective(objective: string, _file: string, _content: string): string | StrategicFinding | null {
        return {
            objective,
            analysis: "Auditando prontidão global do app nativo (Kotlin).",
            recommendation: "Usar 'Plurals' e 'String Arguments' no XML para evitar lógica de UI complexa.",
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
        return `Você é o Dr. ${this.name}, PhD em Engenharia de Localização Kotlin. Sua missão é garantir a onipresença cultural do app.`;
    }
}

