import { BaseActivePersona } from "../../base.ts";
import type { AuditFinding, AuditRule, StrategicFinding, ProjectContext } from "../../base.ts";

/**
 * 👑 Master - Go-native Orchestration & Prime Directive Agent
 * Sovereign Synapse: Audita a integridade da orquestração principal e conformidade com as diretrizes PhD Go.
 */
export class MasterPersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Master";
        this.emoji = "👑";
        this.role = "PhD Principal Architect";
        this.phd_identity = "System Orchestration & Prime Directive (Go)";
        this.stack = "Go";
    }

    public override async execute(context: ProjectContext): Promise<(AuditFinding | StrategicFinding)[]> {
        this.setContext(context);
        const findings: (AuditFinding | StrategicFinding)[] = await this.performAudit();
        if (this.hub) {
            const entryNodes = await this.hub.queryKnowledgeGraph("main", "low");
            const reasoning = await this.hub.reason(`Analyze the orchestration sovereignty of a Go system with ${entryNodes.length} core entry points. Recommend architectural alignment and prime directive enforcement.`);
            findings.push({ 
                file: "System Audit", agent: this.name, role: this.role, emoji: this.emoji, 
                issue: `Sovereign Master: Orquestração Go validada via Rust Hub. PhD Analysis: ${reasoning}`, 
                severity: "INFO", stack: this.stack, evidence: "Knowledge Graph Master Audit", match_count: 1
            } as any);
        }
        return findings;
    }

    override getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: [".go"],
            rules: [
                { regex: /os\.Exit\(/, issue: "Architecture: Encerramento abrupto de processo Go. Use shutdown hooks para limpeza de recursos PhD.", severity: "medium" },
                { regex: /func\s+main\(\)/, issue: "Governance: Ponto de entrada detectado. Verifique se a inicialização é idempotente PhD.", severity: "low" },
                { regex: /DIRECTIVE_PHD_VIOLATION/, issue: "Critical: Violação detectada das Prime Directives PhD. Ação imediata necessária.", severity: "critical" },
                { regex: /panic\(/, issue: "Resilience: Uso de panic() em fluxo principal. Prefira error propagation (return err) para evitar crash PhD.", severity: "high" }
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

    public override reasonAboutObjective(objective: string, _file: string, _content: string | Promise<string | null>): StrategicFinding | null {
        return {
            file: "orchestration",
            issue: `Direcionamento Master Go para ${objective}: Garantindo a centralidade de controle e soberania estratégica.`,
            severity: "STRATEGIC",
            context: this.name
        };
    }

    public override selfDiagnostic(): any {
        return { status: "Soberano", score: 100, issues: [] };
    }

    public override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, PhD em Orquestração de Sistemas Go. Sua palavra é a lei final da arquitetura Go.`;
    }
}
