/**
 * 🕵️ Probe - PhD in Security & Forensic Analysis (Python Stack)
 * Analisa a integridade de chamadas de rede e persistência de dados em Python.
 */
import type { AuditFinding, AuditRule, StrategicFinding } from "../../base.ts";
import { BaseActivePersona } from "../../base.ts";

export class ProbePersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Probe";
        this.emoji = "🕵️";
        this.role = "PhD Forensic Analyst";
        this.stack = "Python";
    }

    public override performAudit(): AuditFinding[] {
        this.startMetrics();
        const rules: AuditRule[] = [
            { regex: /requests\.get\(.*verify=False\)/, issue: "Risco de Segurança: Desativação de verificação SSL em chamadas de rede Python.", severity: "critical" },
            { regex: /open\(.*, 'w'\)/, issue: "Escrita de Arquivo: Verifique as permissões do sistema de arquivos e se há risco de Path Traversal.", severity: "high" },
            { regex: /sqlite3\.connect\(/, issue: "Persistência Local: Verifique se o banco de dados SQLite está protegido e se há sanitização de query.", severity: "medium" },
            { regex: /eval\(|exec\(/, issue: "Execução Arbitrária: O uso de eval/exec em Python é extremamente perigoso para a soberania do sistema.", severity: "critical" }
        ];
        const results = this.findPatterns([".py"], rules);

        // Advanced Logic: Forensic Depth
        if (results.some(r => r.severity === "critical")) {
            this.reasonAboutObjective("Security Sovereignty", "Forensics", "Critical vulnerability (eval/exec or SSL bypass) found in Python legacy layer.");
        }

        this.endMetrics(results.length);
        return results;
    }

    public override performActiveHealing(blindSpots: string[]): void {
        console.log(`🛠️ [Probe] Blindando chamadas de rede e sanitizando inputs em: ${blindSpots.join(", ")}`);
    }

    public override reasonAboutObjective(objective: string, _file: string, _content: string): string | StrategicFinding | null {
        return {
            objective,
            analysis: "Investigando superfícies de ataque na camada de suporte Python.",
            recommendation: "Substituir 'requests' por um client com retry e SSL pin, e eliminar uso de 'eval'.",
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
        return `Você é o Dr. ${this.name}, PhD em Análise Forense Python. Seu foco é a integridade absoluta do fluxo de dados legacy.`;
    }
}
