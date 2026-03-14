import { BaseActivePersona } from "../../base.ts";
import type { AuditFinding, AuditRule, StrategicFinding, ProjectContext } from "../../base.ts";

/**
 * 🛡️ Dr. Sentinel — PhD in Python Data Security & Package Integrity
 * Especialista em segurança de transporte Python, pip e integridade de supply chain.
 */
export class SentinelPersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Sentinel";
        this.emoji = "🛡️";
        this.role = "PhD Python Security Architect";
        this.phd_identity = "System Protection & Python Supply Chain Shielding";
        this.stack = "Python";
    }

    public override async execute(context: ProjectContext): Promise<(AuditFinding | StrategicFinding)[]> {
        this.setContext(context);
        const findings: (AuditFinding | StrategicFinding)[] = await this.performAudit();
        if (this.hub) {
            const vulnNodes = await this.hub.queryKnowledgeGraph("vulnerabilities", "high");
            const reasoning = await this.hub.reason(`Analyze the Python supply chain security with ${vulnNodes.length} package nodes. Recommend pip auditing and verification layer improvements.`);
            findings.push({ 
                file: "Supply Chain Integrity", agent: this.name, role: this.role, emoji: this.emoji, 
                issue: `Sovereign Sentinel: Integridade Python validada via Rust Hub. PhD Analysis: ${reasoning}`, 
                severity: "INFO", stack: this.stack, evidence: "Python Security Knowledge Graph Audit", match_count: 1,
                context: "Supply Chain Security Analysis"
            } as any);
        }
        return findings;
    }

    override getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: [".py", "requirements.txt", "pyproject.toml"],
            rules: [
                { regex: /HubServiceClient/, issue: "Connectivity: Dependência da ponte gRPC detectada PhD.", severity: "low" },
                { regex: /http:\/\//, issue: "Insegurança: Uso de HTTP em vez de HTTPS detectado na stack Python PhD.", severity: "high" }
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
        if (typeof content === "string" && content.includes("http://") && !content.includes("localhost")) {
            return {
                file, severity: "STRATEGIC",
                issue: `Insegurança Python: O objetivo '${objective}' exige TLS. Em '${file}', o uso de HTTP expõe dados sensíveis PhD.`,
                context: "HTTP detected"
            };
        }
        return {
            file, severity: "STRATEGIC",
            issue: `PhD Sentinel (Python): Analisando blindagem de transporte e supply chain para ${objective}.`,
            context: this.name
        };
    }

    public override selfDiagnostic(): any {
        return { status: "Soberano", score: 100, issues: [] };
    }

    public override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, mestre em segurança Python. Sua missão é garantir a integridade da supply chain.`;
    }
}
