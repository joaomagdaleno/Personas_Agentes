import { BaseActivePersona } from "../../base.ts";
import type { AuditFinding, AuditRule, StrategicFinding, ProjectContext } from "../../base.ts";

/**
 * 🌍 Globe - PhD in Internationalization & Cultural Logic (Python Stack)
 * Analisa a integridade de arquivos .po, .mo e suporte a i18n em Python.
 */
export class GlobePersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Globe";
        this.emoji = "🌍";
        this.role = "PhD Localization Engineer";
        this.phd_identity = "Internationalization & Cultural Logic (Python)";
        this.stack = "Python";
    }

    public override async execute(context: ProjectContext): Promise<(AuditFinding | StrategicFinding)[]> {
        this.setContext(context);
        const findings: (AuditFinding | StrategicFinding)[] = await this.performAudit();
        if (this.hub) {
            const i18nNodes = await this.hub.queryKnowledgeGraph("gettext", "medium");
            const reasoning = await this.hub.reason(`Analyze i18n readiness of a Python system with ${i18nNodes.length} gettext patterns. Recommend .po/.mo synchronization.`);
            findings.push({ 
                file: "i18n Audit", agent: this.name, role: this.role, emoji: this.emoji, 
                issue: `Sovereign Globe: Localização Python validada via Rust Hub. PhD Analysis: ${reasoning}`, 
                severity: "INFO", stack: this.stack, evidence: "Knowledge Graph i18n Audit", match_count: 1,
                context: "i18n Readiness Analysis"
            } as any);
        }
        return findings;
    }

    override getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: [".py", ".po", ".mo"],
            rules: [
                { regex: /_\(".*"\)/, issue: "Suporte i18n: Uso de gettext detectado. Verifique se as chaves existem no arquivo de tradução principal.", severity: "low" },
                { regex: /\.po$|\.mo$/, issue: "Recurso de Tradução: Verifique se o binário (.mo) está sincronizado com o fonte (.po).", severity: "medium" },
                { regex: /babel\.support/, issue: "Configuração de Localização: Verifique se os formatos de data e moeda seguem as regras PhD regionais.", severity: "low" },
                { regex: /"[\w\s]{40,}"/, issue: "Hardcoded String: Mova strings longas para o sistema gettext para permitir tradução e soberania linguística.", severity: "medium" }
            ]
        };
    }

    public override reasonAboutObjective(objective: string, file: string, _content: string | Promise<string | null>): StrategicFinding | null {
        return {
            file,
            issue: `Direcionamento Global Python para ${objective}: Garantindo suporte a múltiplas culturas.`,
            severity: "STRATEGIC",
            context: this.name
        };
    }

    public override selfDiagnostic(): any {
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

