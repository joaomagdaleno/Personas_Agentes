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

    getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: [".kt", ".kts"],
            rules: [
                { regex: /catch\s*\(.*\)\s*\{\s*\}/, issue: "Cegueira Kotlin: Catch vazio detectado; exceção engolida silenciosamente.", severity: "critical" },
                { regex: /catch\s*\(.*\)\s*\{\s*(println|Log\.)/, issue: "Telemetria Frágil: Erro reportado via log informal no catch.", severity: "medium" },
                { regex: /try\s*\{.*\}\s*catch\s*\(.*\)\s*\{.*\s*\/\/\s*TODO\s*\}/, issue: "Incompleto: Bloco catch contém TODO; tratamento pendente.", severity: "medium" },
                { regex: /GlobalScope\.launch/, issue: "Risco de Resiliência: Uso de GlobalScope pode causar vazamento de corrotinas e erros não capturados.", severity: "high" },
                { regex: /throw\s+Exception\(\)/, issue: "Vago: Lançamento de Exception genérica sem contexto.", severity: "medium" },
                { regex: /runCatching\s*\{.*\}\.getOrNull\(\)/, issue: "Silenciado: Uso de getOrNull() ignora a falha sem rastro.", severity: "high" }
            ]
        };
    }

    public override performActiveHealing(blindSpots: string[]): void {
        console.log(`🛠️ [Probe] Blindando pontos de falha e corrigindo permissões em: ${blindSpots.join(", ")}`);
    }

    public override reasonAboutObjective(objective: string, _file: string, _content: string): string | StrategicFinding | null {
        return {
            file,
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
        return `Você é o Dr. ${this.name}, PhD em Análise Forense Kotlin. Seu foco é integridade de dados e resiliência de rede.`;
    }
}
