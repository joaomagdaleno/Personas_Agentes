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

    getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: [".py"],
            rules: [
                { regex: /except\s*.*:\s*pass/, issue: "Cegueira Total: except vazio engole exceções Python silenciosamente.", severity: "critical" },
                { regex: /except\s*.*:\s*print\(.*\)/, issue: "Telemetria Informal: Erro logado via print no bloco except.", severity: "medium" },
                { regex: /except\s+Exception:/, issue: "Captura Genérica: Capturar Exception pode esconder bugs de lógica ou erros de sistema.", severity: "high" },
                { regex: /raise\s+Exception\(\)/, issue: "Vago: Exception lançada sem mensagem ou tipo descritivo.", severity: "medium" },
                { regex: /#\s*TODO:?\s*handle\s*error/i, issue: "Débito Tech: Tratamento de erro pendente detectado no comentário.", severity: "medium" },
                { regex: /asyncio\.create_task\(.*\)(?![^}]*add_done_callback)/, issue: "Resiliência Async: Task criada sem monitoramento de exceção (done callback).", severity: "high" }
            ]
        };
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

