import { BaseActivePersona } from "../../base.ts";
import type { ProjectContext, AuditFinding, AuditRule, StrategicFinding } from "../../base.ts";

/**
 * 🛡️ Dr. Sentinel — PhD in Strategic Security & Infrastructure Sovereignty
 * Especialista em integridade estratégica, soberania de infraestrutura e análise PhD.
 */
export class SentinelPersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Sentinel";
        this.emoji = "🛡️";
        this.role = "PhD Strategic Security Architect";
        this.phd_identity = "System Protection & Infrastructure Sovereignty (TypeScript)";
        this.stack = "TypeScript";
    }

    public override async execute(context: ProjectContext): Promise<(AuditFinding | StrategicFinding)[]> {
        this.setContext(context);
        const findings: (AuditFinding | StrategicFinding)[] = await this.performAudit();
        
        if (this.hub) {
            const graph = await this.hub.getKnowledgeGraph("src_local/agents/base.ts", 3);
            const reasoning = await this.hub.reason(`Analyze the system sovereignty with ${graph.nodes.length} core nodes. Recommend structural hardening.`);
            findings.push({ 
                file: "Core Infrastructure", agent: this.name, role: this.role, emoji: this.emoji, 
                issue: `Sovereign Sentinel: Soberania validada via Rust Hub. PhD Analysis: ${reasoning}`, 
                severity: "INFO", stack: this.stack, evidence: "Knowledge Graph Infrastructure Audit", match_count: 1,
                context: "Infrastructure Sovereignty Analysis"
            } as any);
        }
        return findings;
    }

    override getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: ['.proto', '.rs', 'main.go', '.ts'],
            rules: [
                { regex: /HubServiceClient/, issue: 'Connectivity: Dependência da ponte gRPC detectada PhD.', severity: 'low' }
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

    public override reasonAboutObjective(objective: string, file: string, content: string | Promise<string | null>): StrategicFinding | null {
        if (typeof content === 'string' && file.endsWith('.ts') && content.includes("any")) {
            return {
                file, severity: "STRATEGIC",
                issue: `Dívida Técnica: O objetivo '${objective}' é prejudicado pelo uso de 'any' em '${file}', comprometendo a soberania do tipo PhD.`,
                context: "use of 'any' type"
            };
        }
        return {
            file, severity: "STRATEGIC",
            issue: `PhD Sentinel: Analisando soberania estratégica para ${objective}.`,
            context: this.name
        };
    }

    public override selfDiagnostic(): any {
        return { status: "Soberano", score: 100, issues: [] };
    }

    public override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, guardião da soberania e integridade do sistema.`;
    }
}
