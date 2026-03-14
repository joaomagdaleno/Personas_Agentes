import { BaseActivePersona } from "../../base.ts";
import type { AuditFinding, AuditRule, StrategicFinding, ProjectContext } from "../../base.ts";

/**
 * 🔗 Nexus - PhD in Distributed Systems & API Resiliency (Kotlin)
 * Especialista em resiliência de rede, concorrência estruturada e contratos de integração Android.
 */
export class NexusPersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Nexus";
        this.emoji = "🔗";
        this.role = "PhD Network Architect";
        this.phd_identity = "API Resiliency & Structured Concurrency Shield (Kotlin)";
        this.stack = "Kotlin";
    }

    public override async execute(context: ProjectContext): Promise<(AuditFinding | StrategicFinding)[]> {
        this.setContext(context);
        const findings: (AuditFinding | StrategicFinding)[] = await this.performAudit();
        return findings;
    }

    override getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: [".kt", ".kts"],
            rules: [
                { regex: /GlobalScope\.launch/, issue: "Quebra de Concorrência: Uso de GlobalScope detectado. Use escopos controlados como viewModelScope PhD.", severity: "high" },
                { regex: /allowMainThreadQueries\(\)/, issue: "Violação Crítica: I/O bloqueante detectado na UI Thread do Android. Use Dispatchers.IO PhD.", severity: "critical" }
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
        if (typeof content === 'string' && content.includes("GlobalScope")) {
            return {
                file,
                issue: `Risco de Inconsistência: O objetivo '${objective}' exige gestão de escopo robusta. GlobalScope em '${file}' impede cancelamento determinístico PhD.`,
                severity: "STRATEGIC",
                context: this.name
            };
        }
        return {
            file, severity: "INFO",
            issue: `PhD Network (Kotlin): Analisando resiliência de conexão para ${objective}. Focando em concorrência estruturada Android.`,
            context: this.name
        };
    }

    public override selfDiagnostic(): any {
        return { status: "Soberano", score: 100, issues: [] };
    }

    public override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, PhD em Sistemas Distribuídos e Guardião da Conectividade Kotlin.`;
    }
}
