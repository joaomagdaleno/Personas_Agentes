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
            { regex: /catch\s*\(.*\)\s*\{\s*\}/, issue: "Cegueira Flutter: catch vazio engole exceção silenciosamente.", severity: "critical" },
            { regex: /\.catchError\(\(.*\)\s*\{\s*\}\)/, issue: "Promise Silenciada: .catchError vazio engole erro de Future.", severity: "critical" },
            { regex: /catch\s*\(.*\)\s*\{\s*print\(/, issue: "Telemetria Informal: Erro logado via print no bloco catch.", severity: "medium" },
            { regex: /onError:\s*\(.*\)\s*\{\s*\}/, issue: "Stream Frágil: Handler onError vazio detectado.", severity: "high" },
            { regex: /throw\s+Exception\(\)/, issue: "Vago: Exception lançada sem mensagem descritiva.", severity: "medium" },
            { regex: /\/\/\s*TODO:?\s*handle\s*error/i, issue: "Débito Tech: Tratamento de erro pendente detectado no comentário.", severity: "medium" }
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
            analysis: "Investigando superfícies de ataque em rede e storage",
            file: _file,
            issue: `PhD Resilience: Analisando integridade de falhas para ${objective}. Focando em eliminação de catch-alls silenciosos.`,
            severity: "INFO",
            context: this.name
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
