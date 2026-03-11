/**
 * 🔮 Mantra - Rust-native Code Purity & Safety Agent
 * Sovereign Synapse: Audita a pureza de código no ecossistema Rust (unsafe, unwrap, clippy).
 */
import type { AuditRule, StrategicFinding } from "../../base.ts";
import { BaseActivePersona } from "../../base.ts";

export class MantraPersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Mantra";
        this.emoji = "🔮";
        this.role = "PhD Code Purity Guardian";
        this.phd_identity = "Rust Code Purity & Safety";
        this.stack = "Rust";
    }

    public override async execute(context: any): Promise<any> {
        this.setContext(context);
        const findings = await this.performAudit();
        if (this.hub) {
            const purityNodes = await this.hub.queryKnowledgeGraph("unsafe", "high");
            const reasoning = await this.hub.reason(`Analyze the code safety of a Rust system with ${purityNodes.length} unsafe/unwrap patterns. Recommend safe abstractions and clippy compliance.`);
            findings.push({ file: "Code Purity", agent: this.name, role: this.role, emoji: this.emoji, issue: `Sovereign Mantra: Pureza Rust auditada nativamente. PhD Analysis: ${reasoning}`, severity: "INFO", stack: this.stack, evidence: "Knowledge Graph Purity Audit", match_count: 1 } as any);
        }
        return findings;
    }

    getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: [".rs"],
            rules: [
                { regex: /unsafe\s*\{/, issue: "Risco: Bloco unsafe detectado. Encapsule em safe abstractions.", severity: "critical" },
                { regex: /\.unwrap\(\)/, issue: "Crash Potential: unwrap() pode causar panic. Use ? ou match.", severity: "high" },
                { regex: /\.expect\("/, issue: "Crash Controlado: expect() com mensagem — considere Result propagation.", severity: "medium" },
                { regex: /clone\(\)/, issue: "Performance: clone() pode indicar ownership leak. Verifique se borrowing é suficiente.", severity: "low" },
                { regex: /#\[allow\(clippy::/, issue: "Supressão: Supressão de clippy lint detectada. Revise se é justificada.", severity: "medium" },
                { regex: /todo!\(/, issue: "Incompletude: todo!() macro detectada — código incompleto em produção.", severity: "high" }
            ]
        };
    }

    public override reasonAboutObjective(objective: string, _file: string, _content: string): StrategicFinding | null {
        return {
            file: "purity",
            issue: `Direcionamento Rust Mantra para ${objective}: Garantindo segurança a nível de compilador.`,
            severity: "STRATEGIC",
            context: this.name
        };
    }

    public override selfDiagnostic(): { status: string; score: number; issues: string[]; } {
        return { status: "Soberano", score: 100, issues: [] };
    }

    public override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, PhD em Pureza de Código Rust. Sua missão é eliminar unsafety e garantir zero-cost abstractions.`;
    }
}
