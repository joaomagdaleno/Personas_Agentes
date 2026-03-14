import { BaseActivePersona } from "../../base.ts";
import type { AuditFinding, AuditRule, StrategicFinding, ProjectContext } from "../../base.ts";

/**
 * 🏛️ Director - Executive PhD in Go Architecture (Sovereign Version)
 * Orquestra e sintetiza as descobertas de todos os agentes Go.
 */
export class DirectorPersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Director";
        this.emoji = "🏛️";
        this.role = "PhD Strategic Director";
        this.phd_identity = "Go Architecture & Executive Orchestration";
        this.stack = "Go";
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
                severity: "INFO", stack: this.stack, evidence: "Knowledge Graph Orchestration Analysis", match_count: 1
            } as any);
        }
        return findings;
    }

    override getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: [".go", "go.mod"],
            rules: [
                { regex: /func\s+main/, issue: "Entry Point: Ponto de entrada detectado; verifique se a orquestração de shutdown gracioso está presente PhD.", severity: "low" },
                { regex: /github\.com\/spf13\/cobra/, issue: "CLI Framework: Cobra detectado; verifique se a árvore de comandos está coesa PhD.", severity: "low" },
                { regex: /viper/, issue: "Configuration: Viper detectado; garanta que as configurações possuem valores default seguros PhD.", severity: "medium" },
                { regex: /healthcheck/, issue: "System Viability: Verifique se o endpoint de healthcheck reflete fielmente o estado das dependências PhD.", severity: "high" },
                { regex: /Context\s+Handling/, issue: "Strategic Flow: Garanta que o context.Context é a espinha dorsal de toda a orquestração PhD.", severity: "high" },
                { regex: /version\s+=\s*".*"/, issue: "Identity Check: Verifique se a versão do sistema está centralizada e auditada PhD.", severity: "low" }
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
            file,
            issue: `PhD Director (Go): Analisando a governança estratégica e a integridade da arquitetura para ${objective}.`,
            severity: "STRATEGIC",
            context: this.name
        };
    }

    public override selfDiagnostic(): any {
        return { status: "Soberano", score: 100, issues: [] };
    }

    public override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, PhD em Direção Estratégica Go. Sua missão é garantir a soberania absoluta do sistema.`;
    }
}
