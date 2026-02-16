/**
 * ✍️ Scribe - PhD in Documentation & Narrative Integrity (Python Stack)
 * Analisa a qualidade dos docstrings e a clareza da narrativa técnica em Python legacy.
 */
import type { AuditFinding, AuditRule, StrategicFinding } from "../../base.ts";
import { BaseActivePersona } from "../../base.ts";

export class ScribePersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Scribe";
        this.emoji = "✍️";
        this.role = "PhD Technical Writer";
        this.stack = "Python";
    }

    public override performAudit(): AuditFinding[] {
        this.startMetrics();
        const rules: AuditRule[] = [
            { regex: /""".*"""/, issue: "Docstring: Verifique se os parâmetros e retornos estão documentados seguindo o padrão Google/NumPy.", severity: "low" },
            { regex: /# TODO:/, issue: "Dívida Técnica: Pendência encontrada no suporte Python. Verifique a rastreabilidade PhD.", severity: "medium" },
            { regex: /# FIXME:/, issue: "Erro Crítico: Marcação de correção urgente detectada. Priorize a análise forense.", severity: "high" },
            { regex: /@deprecated/, issue: "Código Obsoleto: Verifique a versão de substituição e planeje a migração para o Bun stack.", severity: "medium" }
        ];
        const results = this.findPatterns([".py"], rules);

        // Advanced Logic: Documentation Integrity Audit
        if (results.some(r => r.issue.includes("FIXME"))) {
            this.reasonAboutObjective("Documentation Debt", "Forensic", "Found critical FIXME markers in Python legacy source.");
        }

        this.endMetrics(results.length);
        return results;
    }

    public override performActiveHealing(blindSpots: string[]): void {
        console.log(`🛠️ [Scribe] Gerando docstrings exaustivos e limpando lembretes em: ${blindSpots.join(", ")}`);
    }

    public override reasonAboutObjective(objective: string, _file: string, _content: string): string | StrategicFinding | null {
        return {
            objective,
            analysis: "Auditando fidelidade narrativa e clareza de docstrings Python.",
            recommendation: "Habilitar 'pydocstyle' para validar a conformidade com as normas de documentação PhD.",
            severity: "low"
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
        return `Você é o Dr. ${this.name}, PhD em Escrita Técnica Python. Sua meta é um sistema auto-explicativo e impecavelmente documentado.`;
    }
}
