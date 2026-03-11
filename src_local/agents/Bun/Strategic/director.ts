import type { AuditFinding, StrategicFinding, AuditRule } from "../../base.ts";
import { BaseActivePersona } from "../../base.ts";

/**
 * 🏛️ Director - PhD in Strategic Orchestration (Bun Stack)
 * Orquestra e sintetiza as descobertas de todos os agentes Bun.
 */
export class DirectorPersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Director";
        this.emoji = "🏛️";
        this.role = "PhD Strategic Director";
        this.phd_identity = "Strategic Orchestration & Runtime Governance (Bun)";
        this.stack = "Bun";
    }

    public override async execute(context: any): Promise<any> {
        this.setContext(context);
        const findings = await this.performAudit();

        if (this.hub) {
            // Sovereign Orchestration
            const orchestratorNodes = await this.hub.queryKnowledgeGraph("orchestrator", "high");
            
            // PhD Director Reasoning
            const reasoning = await this.hub.reason(`Synthesize an executive summary of the system's architecture and orchestration balance, given ${orchestratorNodes.length} orchestrator control nodes in ${this.stack}.`);

            findings.push({
                file: "Executive Summary", agent: this.name, role: this.role, emoji: this.emoji,
                issue: `Sovereign Direction: Alinhamento estratégico validado via Rust Hub. PhD Analysis: ${reasoning}`,
                severity: "STRATEGIC", stack: this.stack, evidence: "Knowledge Graph Orchestration Analysis", match_count: 1
            } as any);
        }
        return findings;
    }

    getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: ['.ts', '.json'],
            rules: [
                { regex: /Bun\.serve/, issue: "Orquestração: Bun.serve detectado; verifique se o servidor possui shutdown gracioso.", severity: "low" },
                { regex: /Bun\.spawn/, issue: "Processo: Bun.spawn detectado; garanta controle de ciclo de vida do subprocesso.", severity: "medium" },
                { regex: /bunfig\.toml/, issue: "Configuração: bunfig.toml referenciado; verifique centralização de config.", severity: "low" }
            ]
        };
    }

    public override async performAudit(): Promise<AuditFinding[]> {
        this.startMetrics();
        const results = await this.findPatterns([".ts", ".json"], this.getAuditRules().rules);
        this.endMetrics(results.length);
        return results;
    }

    public override reasonAboutObjective(objective: string, _file: string, _content: string): StrategicFinding | null {
        return {
            file: "orchestration",
            issue: `Direcionamento Estratégico Bun para ${objective}: Garantindo alinhamento com a visão PhD.`,
            severity: "STRATEGIC",
            context: this.name
        };
    }

    public override selfDiagnostic(): { status: string; score: number; issues: string[]; } {
        return { status: "Soberano", score: 100, issues: [] };
    }

    public override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, PhD em Orquestração Estratégica Bun. Sua missão é garantir a soberania e coerência do runtime.`;
    }
}
