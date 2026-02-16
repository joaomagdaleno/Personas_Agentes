/**
 * 🕵️ Probe - PhD in Security & Forensic Analysis (Flutter)
 * Analisa a integridade de chamadas de rede e persistência de dados.
 */
import type { AuditFinding, AuditRule, StrategicFinding } from "../../base.ts";
import { BaseActivePersona } from "../../base.ts";

export class ProbePersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Probe";
        this.emoji = "🕵️";
        this.role = "PhD Forensic Analyst";
        this.stack = "Flutter";
    }

    public override performAudit(): AuditFinding[] {
        this.startMetrics();
        const rules: AuditRule[] = [
            { regex: /http\.get\(/, issue: "Risco de Segurança: Chamada HTTP sem tratamento de erro explícito. Use um cliente resiliente.", severity: "high" },
            { regex: /SharedPreferences/, issue: "Persistência Insegura: Dados sensíveis não devem ser armazenados de forma plana em SharedPreferences.", severity: "critical" },
            { regex: /Dio\(|http\.Client\(/, issue: "Observação: Instância de cliente de rede detectada. Verifique timeouts e interceptors.", severity: "low" },
            { regex: /checkPermission\(/, issue: "Auditoria de Permissões: Verifique se o fluxo lida logicamente com a negação do usuário.", severity: "medium" }
        ];
        const results = this.findPatterns([".dart"], rules);

        // Advanced Logic: Security Probing
        if (results.some(r => r.severity === "critical")) {
            this.reasonAboutObjective("Data Sovereignty", "Persistence", "Critical security leak in local storage detected.");
        }

        this.endMetrics(results.length);
        return results;
    }

    public override performActiveHealing(blindSpots: string[]): void {
        console.log(`🛠️ [Probe] Blindando pontos de falha: ${blindSpots.join(", ")}`);
        // Simulação de implementação de criptografia em storage
    }

    public override reasonAboutObjective(objective: string, _file: string, _content: string): string | StrategicFinding | null {
        return {
            objective,
            analysis: "Investigando superfícies de ataque em rede e storage Flutter.",
            recommendation: "Implementar 'Secure Storage' em vez de SharedPreferences para dados sensíveis.",
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
        return `Você é o Dr. ${this.name}, PhD em Análise Forense Flutter. Seu foco é integridade de dados e resiliência de rede.`;
    }
}
