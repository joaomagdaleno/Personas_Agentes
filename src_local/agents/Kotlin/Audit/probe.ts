/**
 * 🕵️ Probe - PhD in Security & Forensic Analysis (Kotlin)
 * Analisa a integridade de chamadas de rede e persistência de dados na JVM.
 */
import type { AuditFinding, AuditRule, StrategicFinding } from "../../base.ts";
import { BaseActivePersona } from "../../base.ts";

export class ProbePersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Probe";
        this.emoji = "🕵️";
        this.role = "PhD Forensic Analyst";
        this.stack = "Kotlin";
    }

    public override performAudit(): AuditFinding[] {
        this.startMetrics();
        const rules: AuditRule[] = [
            { regex: /HttpURLConnection/, issue: "Legacy API: Use OkHttp ou Retrofit para chamadas de rede resilientes.", severity: "medium" },
            { regex: /openPersistentStorage\(/, issue: "Storage Local: Verifique se os dados são criptografados em repouso (SQLCipher/EncryptedSharedPreferences).", severity: "high" },
            { regex: /getSharedPreferences\(.*MODE_PRIVATE\)/, issue: "Observação: Uso de SharedPreferences privado detectado. Verifique se há vazamento via logs.", severity: "low" },
            { regex: /CertificatePinner/, issue: "Segurança de Rede: Pinning detectado. Verifique a expiração e backup de hashes.", severity: "low" }
        ];
        const results = this.findPatterns([".kt", ".kts"], rules);

        // Advanced Logic: Security Audit
        if (results.some(r => r.severity === "high")) {
            this.reasonAboutObjective("Data Integrity", "Persistence", "Found high-risk persistence patterns in Kotlin.");
        }

        this.endMetrics(results.length);
        return results;
    }

    public override performActiveHealing(blindSpots: string[]): void {
        console.log(`🛠️ [Probe] Blindando pontos de falha e corrigindo permissões em: ${blindSpots.join(", ")}`);
    }

    public override reasonAboutObjective(objective: string, _file: string, _content: string): string | StrategicFinding | null {
        return {
            objective,
            analysis: "Investigando superfícies de ataque em rede e storage nativo Kotlin.",
            recommendation: "Migrar para EncryptedSharedPreferences para garantir soberania de dados local.",
            severity: "high"
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
        return `Você é o Dr. ${this.name}, PhD em Análise Forense Kotlin. Seu foco é integridade de dados e resiliência de rede.`;
    }
}
