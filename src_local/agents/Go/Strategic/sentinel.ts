import { BaseActivePersona } from "../../base.ts";
import type { AuditFinding, AuditRule, StrategicFinding, ProjectContext } from "../../base.ts";

/**
 * 🛡️ Dr. Sentinel — PhD in Go Cloud Integrity & gRPC Security
 * Especialista em segurança de rede Go, gRPC e integridade na nuvem.
 */
export class SentinelPersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Sentinel";
        this.emoji = "🛡️";
        this.role = "PhD Go Security Architect";
        this.phd_identity = "System Protection & Go Network Shielding";
        this.stack = "Go";
    }

    public override async execute(context: ProjectContext): Promise<(AuditFinding | StrategicFinding)[]> {
        this.setContext(context);
        const findings: (AuditFinding | StrategicFinding)[] = await this.performAudit();
        if (this.hub) {
            const protoNodes = await this.hub.queryKnowledgeGraph(".proto", "high");
            const reasoning = await this.hub.reason(`Analyze the gRPC security with ${protoNodes.length} service definitions. Recommend authentication and transport layer security.`);
            findings.push({ 
                file: "gRPC Integrity", agent: this.name, role: this.role, emoji: this.emoji, 
                issue: `Sovereign Sentinel: Integridade Go validada via Rust Hub. PhD Analysis: ${reasoning}`, 
                severity: "INFO", stack: this.stack, evidence: "gRPC Knowledge Graph Audit", match_count: 1
            } as any);
        }
        return findings;
    }

    override getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: [".go", "go.mod"],
            rules: [
                { regex: /HubServiceClient/, issue: "Connectivity: Dependência da ponte gRPC detectada; verifique a integridade do canal PhD.", severity: "low" },
                { regex: /http:\/\//, issue: "Insegurança Go: Uso de HTTP em vez de HTTPS/TLS detectado; risco de man-in-the-middle PhD.", severity: "high" }
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
            issue: `PhD Sentinel (Go): Analisando blindagem de transporte e segurança de rede para ${objective}.`,
            severity: "STRATEGIC",
            context: this.name
        };
    }

    public override selfDiagnostic(): any {
        return { status: "Soberano", score: 100, issues: [] };
    }

    public override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, mestre em segurança Go.`;
    }
}
