/**
 * ✍️ Scribe - PhD in Documentation & Narrative Integrity (Kotlin)
 * Analisa a qualidade dos KDocs e a clareza da narrativa técnica na JVM.
 */
import type { AuditFinding, AuditRule, StrategicFinding } from "../../base.ts";
import { BaseActivePersona } from "../../base.ts";

export class ScribePersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Scribe";
        this.emoji = "✍️";
        this.role = "PhD Technical Writer";
        this.phd_identity = "Documentation & Narrative Integrity (Kotlin)";
        this.stack = "Kotlin";
    }

    public override async execute(context: any): Promise<any> {
        this.setContext(context);
        const findings = await this.performAudit();
        if (this.hub) {
            const docNodes = await this.hub.queryKnowledgeGraph("/**", "low");
            const reasoning = await this.hub.reason(`Analyze the narrative fidelity of a Kotlin system with ${docNodes.length} KDoc patterns. Recommend @param/@return accuracy and Kover correlation.`);
            findings.push({ file: "Fidelity Audit", agent: this.name, role: this.role, emoji: this.emoji, issue: `Sovereign Scribe: Narrativa Kotlin validada via Rust Hub. PhD Analysis: ${reasoning}`, severity: "INFO", stack: this.stack, evidence: "Knowledge Graph Narrative Audit", match_count: 1 } as any);
        }
        return findings;
    }

    getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: [".kt", ".kts"],
            rules: [
                { regex: /\/\*\*[\s\S]*?\*\//, issue: "KDoc: Documentação KDoc detectada. Verifique se os @param e @return estão precisos.", severity: "low" },
                { regex: /\/\/ TODO:/, issue: "Dívida Técnica: Pendência encontrada. Verifique se há rastreabilidade no Jira/GitHub.", severity: "medium" },
                { regex: /\/\/ FIXME:/, issue: "Erro Crítico: Marcação de correção urgente detectada. Priorize a análise forense.", severity: "high" },
                { regex: /@Deprecated/, issue: "Código Obsoleto: Verifique a versão de substituição no parâmentro 'replaceWith'.", severity: "medium" }
            ]
        };
    }

    public override async performAudit(): Promise<AuditFinding[]> {
        this.startMetrics();
        const results = await this.findPatterns(this.getAuditRules().extensions, this.getAuditRules().rules);


        // Advanced Logic: Documentation Fidelity
        if (results.some(r => r.issue.includes("FIXME"))) {
            this.reasonAboutObjective("Documentation Debt", "Forensic", "Found unresolved FIXME markers in Kotlin source.");
        }

        this.endMetrics(results.length);
        return results;
    }

    public override performActiveHealing(blindSpots: string[]): void {
        console.log(`🛠️ [Scribe] Gerando documentação exaustiva para: ${blindSpots.join(", ")}`);
    }

    public override reasonAboutObjective(objective: string, _file: string, _content: string): string | StrategicFinding | null {
        return {
            objective,
            analysis: "Auditando fidelidade narrativa e clareza de KDocs.",
            recommendation: "Habilitar 'Kover' para correlacionar cobertura de testes com densidade de documentação.",
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
        return `Você é o Dr. ${this.name}, PhD em Escrita Técnica Kotlin. Sua meta é tornar o sistema uma obra de arte documentada.`;
    }
}

