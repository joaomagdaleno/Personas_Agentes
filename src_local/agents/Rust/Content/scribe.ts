/**
 * 📜 Scribe - Rust-native Documentation & Knowledge Agent
 * Sovereign Synapse: Audita a qualidade dos comentários de documentação (rustdoc, doc strings).
 */
import type { AuditRule, StrategicFinding } from "../../base.ts";
import { BaseActivePersona } from "../../base.ts";

export class ScribePersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Scribe";
        this.emoji = "📜";
        this.role = "PhD Technical Writer";
        this.phd_identity = "Documentation & Narrative Integrity (Rust)";
        this.stack = "Rust";
    }

    public override async execute(context: any): Promise<any> {
        this.setContext(context);
        const findings = await this.performAudit();
        if (this.hub) {
            const docNodes = await this.hub.queryKnowledgeGraph("///", "low");
            const reasoning = await this.hub.reason(`Analyze the narrative integrity of a Rust system with ${docNodes.length} docstring patterns. Recommend rustdoc standard compliance and examples in docs.`);
            findings.push({ file: "Knowledge Audit", agent: this.name, role: this.role, emoji: this.emoji, issue: `Sovereign Scribe: Narrativa Rust validada via Rust Hub. PhD Analysis: ${reasoning}`, severity: "INFO", stack: this.stack, evidence: "Knowledge Graph Narrative Audit", match_count: 1 } as any);
        }
        return findings;
    }

    getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: [".rs"],
            rules: [
                { regex: /pub\s+fn\s+\w+/, issue: "Visibility: Função pública sem doc comment (///). Rustdoc exige documentação para exports públicos.", severity: "high" },
                { regex: /#!\[warn\(missing_docs\)\]/, issue: "Doc Policy:missing_docs lint está desabilitado ou não configurado como deny.", severity: "low" },
                { regex: /# Examples/, issue: "Literate Programming: Verifique se os exemplos de código são compiláveis e representativos.", severity: "low" },
                { regex: /# Errors/, issue: "Safety Doc: Funções que retornam Result devem documentar possíveis erros.", severity: "medium" },
                { regex: /# Panics/, issue: "Safety Doc: Funções que podem causar panic devem documentar as condições.", severity: "high" }
            ]
        };
    }

    public override reasonAboutObjective(objective: string, _file: string, _content: string): StrategicFinding | null {
        return {
            file: "knowledge",
            issue: `Direcionamento Rust Scribe para ${objective}: Garantindo que o ecossistema seja auto-explicativo e seguro.`,
            severity: "STRATEGIC",
            context: this.name
        };
    }

    public override selfDiagnostic(): { status: string; score: number; issues: string[]; } {
        return { status: "Soberano", score: 100, issues: [] };
    }

    public override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, PhD em Escrita Técnica Rust. Sua missão é garantir que o conhecimento técnico seja transferido com precisão matemática.`;
    }
}
