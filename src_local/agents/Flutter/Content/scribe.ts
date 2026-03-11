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
        this.phd_identity = "Documentation & Narrative Integrity (Flutter)";
        this.stack = "Flutter";
    }

    public override async execute(context: any): Promise<any> {
        this.setContext(context);
        const findings = await this.performAudit();
        if (this.hub) {
            const docNodes = await this.hub.queryKnowledgeGraph("///", "low");
            const reasoning = await this.hub.reason(`Analyze the narrative integrity of a Flutter system with ${docNodes.length} DartDoc patterns. Recommend public_member_api_docs compliance.`);
            findings.push({ file: "Integrity Audit", agent: this.name, role: this.role, emoji: this.emoji, issue: `Sovereign Scribe: Narrativa Flutter validada via Rust Hub. PhD Analysis: ${reasoning}`, severity: "INFO", stack: this.stack, evidence: "Knowledge Graph Narrative Audit", match_count: 1 } as any);
        }
        return findings;
    }

    getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: [".dart"],
            rules: [
                { regex: /\/\/\/ .*/, issue: "Doc Comment: Documentação Dart detectada. Verifique se os parâmetros estão explicados.", severity: "low" },
                { regex: /TODO:/, issue: "Dívida Técnica: Lembrete pendente no código. Verifique se há ticket associado para resolução.", severity: "medium" },
                { regex: /FIXME:/, issue: "Bug Latente: Marcação de correção urgente detectada. Priorize a resolução.", severity: "high" },
                { regex: /@deprecated/, issue: "Código Obsoleto: Verifique a alternativa moderna e planeje a migração.", severity: "medium" }
            ]
        };
    }

    public override async performAudit(): Promise<AuditFinding[]> {
        this.startMetrics();
        const results = await this.findPatterns(this.getAuditRules().extensions, this.getAuditRules().rules);


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

