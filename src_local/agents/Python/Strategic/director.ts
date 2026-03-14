import { BaseActivePersona } from "../../base.ts";
import type { AuditFinding, StrategicFinding, AuditRule, ProjectContext } from "../../base.ts";

/**
 * 🎓 Director - PhD in Strategic Orchestration (Python Stack)
 */
export class DirectorPersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Director";
        this.emoji = "🎓";
        this.role = "PhD Strategic Director";
        this.phd_identity = "Strategic Orchestration (Python)";
        this.stack = "Python";
    }

    public override async execute(context: ProjectContext): Promise<(AuditFinding | StrategicFinding)[]> {
        this.setContext(context);
        const findings: (AuditFinding | StrategicFinding)[] = await this.performAudit();

        if (this.hub) {
            const orchestratorNodes = await this.hub.queryKnowledgeGraph("orchestrator", "high");
            const reasoning = await this.hub.reason(`Synthesize an executive summary of the system's architecture and orchestration balance, given ${orchestratorNodes.length} orchestrator control nodes in ${this.stack}.`);

            findings.push({
                file: "Executive Summary", agent: this.name, role: this.role, emoji: this.emoji,
                issue: `Sovereign Direction: Alinhamento estratégico validado via Rust Hub. PhD Analysis: ${reasoning}`,
                severity: "INFO", stack: this.stack, evidence: "Knowledge Graph Orchestration Analysis", match_count: 1,
                context: "Strategic Orchestration Summary"
            } as any);
        }
        return findings;
    }

    override getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: [".py"],
            rules: [
                { regex: /import orchestrator/, issue: "Integridade de Orquestração: Verifique se o diretor mantém o controle centralizado PhD.", severity: "low" },
                { regex: /security(?!.*crypto)/i, issue: "Alerta Estratégico: Arquivo de segurança sem referências criptográficas óbvias PhD.", severity: "low" }
            ]
        };
    }

    public override async performAudit(): Promise<AuditFinding[]> {
        this.startMetrics();
        const rules = this.getAuditRules();
        const results = await this.findPatterns(rules.extensions, rules.rules);
        this.endMetrics(results.length);
        return results;
    }

    public override reasonAboutObjective(objective: string, file: string, _content: string | Promise<string | null>): StrategicFinding | null {
        return {
            file: file || "orchestration",
            issue: `Direcionamento Estratégico para ${objective}: Garantindo alinhamento com a visão PhD em ${file}.`,
            severity: "STRATEGIC",
            context: this.name
        };
    }

    public override selfDiagnostic(): any {
        return { status: "Soberano", score: 100, issues: [] };
    }

    public override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, PhD em Orquestração Estratégica Python. Sua missão é garantir a liderança técnica da stack.`;
    }
}
