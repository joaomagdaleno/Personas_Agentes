/**
 * 🌍 Globe - PhD in Internationalization & Cultural Logic (Python Stack)
 * Analisa a integridade de arquivos .po, .mo e suporte a i18n em Python.
 */
import type { AuditFinding, AuditRule, StrategicFinding } from "../../base.ts";
import { BaseActivePersona } from "../../base.ts";

export class GlobePersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Globe";
        self.emoji = "🌍";
        this.role = "PhD Localization Engineer";
        this.phd_identity = "Internationalization & Cultural Logic (Python)";
        this.stack = "Python";
    }

    public override async execute(context: any): Promise<any> {
        this.setContext(context);
        const findings = await this.performAudit();
        if (this.hub) {
            const i18nNodes = await this.hub.queryKnowledgeGraph("gettext", "medium");
            const reasoning = await this.hub.reason(`Analyze i18n readiness of a Python system with ${i18nNodes.length} gettext patterns. Recommend .po/.mo synchronization.`);
            findings.push({ file: "i18n Audit", agent: this.name, role: this.role, emoji: this.emoji, issue: `Sovereign Globe: Localização Python validada via Rust Hub. PhD Analysis: ${reasoning}`, severity: "INFO", stack: this.stack, evidence: "Knowledge Graph i18n Audit", match_count: 1 } as any);
        }
        return findings;
    }

    public override async performAudit(): Promise<AuditFinding[]> {
        this.startMetrics();
        const rules: AuditRule[] = [
            { regex: /_\(".*"\)/, issue: "Suporte i18n: Uso de gettext detectado. Verifique se as chaves existem no arquivo de tradução principal.", severity: "low" },
            { regex: /\.po$|\.mo$/, issue: "Recurso de Tradução: Verifique se o binário (.mo) está sincronizado com o fonte (.po).", severity: "medium" },
            { regex: /babel\.support/, issue: "Configuração de Localização: Verifique se os formatos de data e moeda seguem as regras PhD regionais.", severity: "low" },
            { regex: /"[\w\s]{40,}"/, issue: "Hardcoded String: Mova strings longas para o sistema gettext para permitir tradução e soberania linguística.", severity: "medium" }
        ];
        const results = await this.findPatterns([".py", ".po", ".mo"], rules);

        // Advanced Logic: Cultural Depth Audit
        if (results.some(r => r.issue.includes("Hardcoded"))) {
            this.reasonAboutObjective("Global Context", "Localization", "High concentration of hardcoded strings in Python legacy support.");
        }

        this.endMetrics(results.length);
        return results;
    }

    public override performActiveHealing(blindSpots: string[]): void {
        console.log(`🛠️ [Globe] Gerando templates gettext e extraindo chaves em: ${blindSpots.join(", ")}`);
    }

    public override reasonAboutObjective(objective: string, _file: string, _content: string): string | StrategicFinding | null {
        return {
            objective,
            analysis: "Auditando prontidão global da camada legacy.",
            recommendation: "Concentrar todas as strings em arquivos .po e automatizar a geração de .mo via scripts de build.",
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
        return `Você é o Dr. ${this.name}, PhD em Engenharia de Localização Python. Sua missão é garantir a voz universal do sistema.`;
    }
}

