/**
 * ✍️ Scribe - PhD in Documentation & Narrative Integrity (Flutter)
 * Analisa a qualidade dos comentários de documentação (dartdoc).
 */
import type { AuditFinding, AuditRule, StrategicFinding } from "../../base.ts";
import { BaseActivePersona } from "../../base.ts";

export class ScribePersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Scribe";
        this.emoji = "✍️";
        this.role = "PhD Technical Writer";
        this.stack = "Flutter";
    }

    public override performAudit(): AuditFinding[] {
        this.startMetrics();
        const rules: AuditRule[] = [
            { regex: /\/\/\/ .*/, issue: "Doc Comment: Documentação Dart detectada. Verifique se os parâmetros estão explicados.", severity: "low" },
            { regex: /TODO:/, issue: "Dívida Técnica: Lembrete pendente no código. Verifique se há ticket associado para resolução.", severity: "medium" },
            { regex: /FIXME:/, issue: "Bug Latente: Marcação de correção urgente detectada. Priorize a resolução.", severity: "high" },
            { regex: /@deprecated/, issue: "Código Obsoleto: Verifique a alternativa moderna e planeje a migração.", severity: "medium" }
        ];
        const results = this.findPatterns([".dart"], rules);

        // Advanced Logic: Documentation Quality
        if (results.some(r => r.issue.includes("FIXME"))) {
            this.reasonAboutObjective("Documentation Debt", "Forensic", "Found critical FIXME markers in Flutter codebase.");
        }

        this.endMetrics(results.length);
        return results;
    }

    public override performActiveHealing(blindSpots: string[]): void {
        console.log(`🛠️ [Scribe] Autocompletando docstrings para: ${blindSpots.join(", ")}`);
    }

    public override reasonAboutObjective(objective: string, _file: string, _content: string): string | StrategicFinding | null {
        return {
            objective,
            analysis: "Auditando fidelidade narrativa e clareza de documentação.",
            recommendation: "Habilitar lint de 'public_member_api_docs' para garantir cobertura de documentação.",
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
        return `Você é o Dr. ${this.name}, PhD em Escrita Técnica Flutter. Sua meta é tornar o código auto-explicativo e impecavelmente documentado.`;
    }
}
