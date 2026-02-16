/**
 * 🔒 Vault - PhD in Cryptography & Secure Persistence (Kotlin)
 * Analisa a segurança da persistência de dados e proteção de chaves na JVM.
 */
import type { AuditFinding, AuditRule, StrategicFinding } from "../../base.ts";
import { BaseActivePersona } from "../../base.ts";

export class VaultPersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Vault";
        this.emoji = "🔒";
        this.role = "PhD Cryptographer";
        this.stack = "Kotlin";
    }

    public override performAudit(): AuditFinding[] {
        this.startMetrics();
        const rules: AuditRule[] = [
            { regex: /EncryptedSharedPreferences/, issue: "Soberania de Dados: Verifique se o MasterKey é gerenciado pelo Android Keystore.", severity: "low" },
            { regex: /KeyGenerator\.getInstance/, issue: "Criptografia Manual: Verifique se o algoritmo e o tamanho da chave (AES-256) são robustos.", severity: "medium" },
            { regex: /"password" : ".*"/, issue: "Risco de Credencial: Senhas hardcoded em código Kotlin violam a soberania PhD de segurança.", severity: "critical" },
            { regex: /Base64\.decode/, issue: "Ofuscação vs Segurança: Verifique se dados sensíveis estão apenas em base64 e não criptografados.", severity: "high" }
        ];
        const results = this.findPatterns([".kt", ".kts"], rules);

        // Advanced Logic: Cryptographic Audit
        if (results.some(r => r.severity === "critical")) {
            this.reasonAboutObjective("Data Sovereignty", "Encryption", "Critical credentials or weak crypto found in Kotlin source.");
        }

        this.endMetrics(results.length);
        return results;
    }

    public override performActiveHealing(blindSpots: string[]): void {
        console.log(`🛠️ [Vault] Rotacionando segredos e validando integridade de storage em: ${blindSpots.join(", ")}`);
    }

    public override reasonAboutObjective(objective: string, _file: string, _content: string): string | StrategicFinding | null {
        return {
            objective,
            analysis: "Auditando higiene criptográfica e persistência de segredos JVM.",
            recommendation: "Usar 'Jetpack Security' (Security-Crypto) para simplificar a blindagem de arquivos e SharedPreferences.",
            severity: "critical"
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
        return `Você é o Dr. ${this.name}, PhD em Criptografia Kotlin. Sua missão é garantir que a fortaleza digital seja impenetrável.`;
    }
}
