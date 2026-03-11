/**
 * 🌍 Globe - Rust-native Internationalization Agent
 * Sovereign Synapse: Audita a maturidade i18n no ecossistema Rust (i18n-embed, fluent).
 */
import type { AuditRule, StrategicFinding } from "../../base.ts";
import { BaseActivePersona } from "../../base.ts";

export class GlobePersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Globe";
        this.emoji = "🌍";
        this.role = "PhD i18n Specialist";
        this.phd_identity = "Rust Internationalization & Encoding Safety";
        this.stack = "Rust";
    }

    public override async execute(context: any): Promise<any> {
        this.setContext(context);
        const findings = await this.performAudit();
        if (this.hub) {
            const i18nNodes = await this.hub.queryKnowledgeGraph("i18n", "medium");
            const reasoning = await this.hub.reason(`Analyze i18n readiness of the Rust ecosystem with ${i18nNodes.length} internationalization patterns. Recommend fluent/i18n-embed migration.`);
            findings.push({ file: "i18n Audit", agent: this.name, role: this.role, emoji: this.emoji, issue: `Sovereign Globe: i18n Rust auditada nativamente. PhD Analysis: ${reasoning}`, severity: "INFO", stack: this.stack, evidence: "Knowledge Graph i18n Audit", match_count: 1 } as any);
        }
        return findings;
    }

    getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: [".rs"],
            rules: [
                { regex: /"[A-Z][a-z\u00C0-\u00FF]{20,}"/, issue: "Hardcoded String: Texto longo hardcoded em Rust; use fluent ou i18n-embed.", severity: "medium" },
                { regex: /format!\(/, issue: "Formatação: Verifique se format! com strings de UI está externalizado para i18n.", severity: "low" },
                { regex: /include_str!/, issue: "Embedded Content: include_str! com texto potencialmente localizável.", severity: "low" },
                { regex: /panic!\(["'][A-Z]/, issue: "Error i18n: Mensagens de erro em panic! devem ser localizáveis para UX global.", severity: "medium" }
            ]
        };
    }

    public override reasonAboutObjective(objective: string, _file: string, _content: string): StrategicFinding | null {
        return {
            file: "i18n",
            issue: `Direcionamento Rust Globe para ${objective}: Garantindo prontidão global via fluent.`,
            severity: "STRATEGIC",
            context: this.name
        };
    }

    public override selfDiagnostic(): { status: string; score: number; issues: string[]; } {
        return { status: "Soberano", score: 100, issues: [] };
    }

    public override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, PhD em i18n Rust. Sua missão é garantir portabilidade cultural total.`;
    }
}
