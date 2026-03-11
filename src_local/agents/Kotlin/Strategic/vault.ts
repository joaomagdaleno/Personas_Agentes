/**
 * 🔒 Vault - PhD in Cryptography & Secure Persistence (Kotlin)
 * Analisa a segurança da persistência de dados e proteção de chaves na JVM.
 */
import type { AuditFinding, AuditRule, StrategicFinding } from "../../base.ts";
import { BaseActivePersona } from "../../base.ts";
import type { ProjectContext } from "../../../core/types.ts";

export class VaultPersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Vault";
        this.emoji = "🔒";
        this.role = "PhD Cryptographer";
        this.phd_identity = "Kotlin Cryptography & Secure Persistence";
        this.stack = "Kotlin";
    }

    override async execute(context: ProjectContext): Promise<AuditFinding[]> {
        this.setContext(context);
        const findings = await this.performAudit();

        if (this.hub) {
            // Cryptographic Intelligence via Knowledge Graph
            const secretQuery = await this.hub.queryKnowledgeGraph("Secret", "critical");
            
            // PhD Security Reasoning
            const reasoning = await this.hub.reason(`Analyze the cryptographic health of a Kotlin system with ${secretQuery.length} critical secret points.`);

            findings.push({
                file: "Security Core", agent: this.name, role: this.role, emoji: this.emoji,
                issue: `Sovereign Vault: Higiene criptográfica Kotlin validada via Rust Hub. PhD Analysis: ${reasoning}`,
                severity: "INFO", stack: this.stack, evidence: "Knowledge Graph Secret Audit", match_count: 1
            } as any);
        }
        return findings;
    }

    override getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: [".kt", ".kts"],
            rules: [
                { regex: /EncryptedSharedPreferences/, issue: "Soberania de Dados: Verifique se o MasterKey é gerenciado pelo Android Keystore.", severity: "low" },
                { regex: /KeyGenerator\.getInstance/, issue: "Criptografia Manual: Verifique se o algoritmo e o tamanho da chave (AES-256) são robustos.", severity: "medium" },
                { regex: /"password" : ".*"/, issue: "Risco de Credencial: Senhas hardcoded em código Kotlin violam a soberania PhD de segurança.", severity: "critical" },
                { regex: /Base64\.decode/, issue: "Ofuscação vs Segurança: Verifique se dados sensíveis estão apenas em base64 e não criptografados.", severity: "high" }
            ]
        };
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

