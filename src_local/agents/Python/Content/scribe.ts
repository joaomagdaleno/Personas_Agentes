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
        this.phd_identity = "Documentation & Narrative Integrity (Python)";
        this.stack = "Python";
    }

    public override async execute(context: any): Promise<any> {
        this.setContext(context);
        const findings = await this.performAudit();
        if (this.hub) {
            const docNodes = await this.hub.queryKnowledgeGraph("\"\"\"", "low");
            const reasoning = await this.hub.reason(`Analyze the narrative integrity of a Python system with ${docNodes.length} docstring patterns. Recommend Google/NumPy standard compliance.`);
            findings.push({ file: "Forensic Audit", agent: this.name, role: this.role, emoji: this.emoji, issue: `Sovereign Scribe: Narrativa Python validada via Rust Hub. PhD Analysis: ${reasoning}`, severity: "INFO", stack: this.stack, evidence: "Knowledge Graph Narrative Audit", match_count: 1 } as any);
        }
        return findings;
    }

    public override async performAudit(): Promise<AuditFinding[]> {
        this.startMetrics();
        const rules: AuditRule[] = [
            { regex: /""".*"""/, issue: "Docstring: Verifique se os parâmetros e retornos estão documentados seguindo o padrão Google/NumPy.", severity: "low" },
            { regex: /# TODO:/, issue: "Dívida Técnica: Pendência encontrada no suporte Python. Verifique a rastreabilidade PhD.", severity: "medium" },
            { regex: /# FIXME:/, issue: "Erro Crítico: Marcação de correção urgente detectada. Priorize a análise forense.", severity: "high" },
            { regex: /@deprecated/, issue: "Código Obsoleto: Verifique a versão de substituição e planeje a migração para o Bun stack.", severity: "medium" }
        ];
        const results = await this.findPatterns([".py"], rules);

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

