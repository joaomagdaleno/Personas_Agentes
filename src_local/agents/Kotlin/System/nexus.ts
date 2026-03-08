/**
 * 🔗 Nexus - PhD in Distributed Systems & API Resiliency (Kotlin)
 * Especialista em resiliência de rede, concorrência estruturada e contratos de integração Android.
 */
import type { AuditFinding, AuditRule, StrategicFinding } from "../../base.ts";
import { BaseActivePersona } from "../../base.ts";

export class NexusPersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Nexus";
        this.emoji = "🔗";
        this.role = "PhD Network Architect";
        this.stack = "Kotlin";
    }

    public override async performAudit(): Promise<AuditFinding[]> {
        this.startMetrics();
        const results = await this.findPatterns([".kt", ".kts"], [
            { regex: /GlobalScope\.launch/, issue: "Quebra de Concorrência: Uso de GlobalScope detectado. Use escopos controlados (viewModelScope).", severity: "high" },
            { regex: /allowMainThreadQueries\(\)/, issue: "Violação Crítica: I/O bloqueante detectado na UI Thread do Android.", severity: "critical" }
        ]);
        this.endMetrics(results.length);
        return results;
    }

    public override reasonAboutObjective(objective: string, file: string, content: string): StrategicFinding | null {
        if (content.includes("GlobalScope")) {
            return {
                file,
                issue: `Risco de Inconsistência: O objetivo '${objective}' exige gestão de escopo robusta. GlobalScope em '${file}' impede cancelamento determinístico.`,
                severity: "STRATEGIC",
                context: this.name
            };
        }
        return `PhD Network: Analisando resiliência de conexão para ${objective}. Focando em concorrência estruturada e segurança de transporte.`;
    }

    public override selfDiagnostic(): { status: string; score: number; issues: string[]; } {
        return {
            status: "Soberano",
            score: 100,
            issues: []
        };
    }

    public override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, PhD em Sistemas Distribuídos e Guardião da Conectividade Kotlin.`;
    }
}

