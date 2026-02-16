/**
 * 🛡️ Sentinel - PhD in Security Architecture (Kotlin)
 * Guardião da segurança Kotlin e Auditor de Compliance Android e segurança de transporte.
 */
import type { AuditFinding, AuditRule, StrategicFinding } from "../../base.ts";
import { BaseActivePersona } from "../../base.ts";

export class SentinelPersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Sentinel";
        this.emoji = "🛡️";
        this.role = "PhD Security Architect";
        this.stack = "Kotlin";
    }

    public override performAudit(): AuditFinding[] {
        this.startMetrics();
        const results = this.findPatterns([".kt", ".xml"], [
            { regex: /http:\/\//, issue: "Vulnerabilidade: Cleartext HTTP detectado. Risco de ataque MITM.", severity: "critical" },
            { regex: /android:usesCleartextTraffic="true"/, issue: "Risco: Tráfego cleartext expressamente habilitado no Manifest.", severity: "critical" },
            { regex: /\.allowBackup\s*=\s*true/, issue: "Risco: Backup ADB habilitado. Vulnerável a exfiltração de dados físicos.", severity: "high" }
        ]);
        this.endMetrics(results.length);
        return results;
    }

    public override reasonAboutObjective(objective: string, file: string, content: string): StrategicFinding | null {
        if (content.includes("http://")) {
            return {
                file,
                issue: `Vulnerabilidade Crítica: O objetivo '${objective}' exige canal seguro. Uso de HTTP em '${file}' viola o DNA PhD e compromete a integridade.`,
                severity: "STRATEGIC",
                context: this.name
            };
        }
        return `PhD Security: Analisando perímetro de segurança para ${objective}. Focando em segurança de transporte e proteção de manifesto.`;
    }

    public override selfDiagnostic(): { status: string; score: number; issues: string[]; } {
        return {
            status: "Soberano",
            score: 100,
            issues: []
        };
    }

    public override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, PhD em Segurança de Arquitetura e Guardião Sênior Kotlin.`;
    }
}
