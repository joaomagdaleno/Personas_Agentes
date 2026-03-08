/**
 * 🗣️ Echo - PhD in Observability (Kotlin)
 * Especialista em telemetria Android, monitoramento de performance e logs estruturados via Timber.
 */
import type { AuditFinding, AuditRule, StrategicFinding } from "../../base.ts";
import { BaseActivePersona } from "../../base.ts";

export class EchoPersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Echo";
        this.emoji = "🗣️";
        this.role = "PhD Observability Engineer";
        this.stack = "Kotlin";
    }

    public override async performAudit(): Promise<AuditFinding[]> {
        this.startMetrics();
        const results = await this.findPatterns([".kt"], [
            { regex: /println\(/, issue: "Aviso: println() detectado em vez de telemetria estruturada. Use Timber.", severity: "medium" },
            { regex: /catch\s*\(\w+:\s*Exception\)\s*\{\s*\}/, issue: "Cegueira Forense: Bloco catch vazio detectado. Erros silenciados.", severity: "critical" }
        ]);
        this.endMetrics(results.length);
        return results;
    }

    public override reasonAboutObjective(objective: string, file: string, content: string): StrategicFinding | null {
        if (content.includes("println(")) {
            return {
                file,
                issue: `Obsolência de Logs: O objetivo '${objective}' exige observabilidade total. 'println' em '${file}' é invisível para auditoria PhD.`,
                severity: "STRATEGIC",
                context: this.name
            };
        }
        return `PhD Observability: Analisando maturidade de telemetria para ${objective}. Focando em rastreabilidade e logs estruturados.`;
    }

    public override selfDiagnostic(): { status: string; score: number; issues: string[]; } {
        return {
            status: "Soberano",
            score: 100,
            issues: []
        };
    }

    public override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, PhD em Observabilidade de Sistemas e Especialista Android/Kotlin.`;
    }
}

