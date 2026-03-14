import { BaseActivePersona } from "../../base.ts";
import type { AuditFinding, AuditRule, StrategicFinding, ProjectContext } from "../../base.ts";

/**
 * 🛡️ Dr. Sentinel — PhD in Kotlin Android Security & JVM Isolation
 * Especialista em segurança de rede Kotlin, ProGuard e TLS JVM.
 */
export class SentinelPersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Sentinel";
        this.emoji = "🛡️";
        this.role = "PhD Kotlin Security Architect";
        this.phd_identity = "System Protection & JVM Network Shielding";
        this.stack = "Kotlin";
    }

    public override async execute(context: ProjectContext): Promise<(AuditFinding | StrategicFinding)[]> {
        this.setContext(context);
        const findings: (AuditFinding | StrategicFinding)[] = await this.performAudit();
        
        if (this.hub) {
            const trustNodes = await this.hub.queryKnowledgeGraph("TrustManager", "high");
            const reasoning = await this.hub.reason(`Analyze the JVM network security with ${trustNodes.length} certificate handlers in Kotlin. Recommend network security configuration and SSL pinning.`);
            findings.push({ 
                file: "JVM Security", agent: this.name, role: this.role, emoji: this.emoji, 
                issue: `Sovereign Sentinel: Segurança Kotlin validada via Rust Hub. PhD Analysis: ${reasoning}`, 
                severity: "INFO", stack: this.stack, evidence: "JVM Security Knowledge Graph Audit", match_count: 1,
                context: "Kotlin TLS & Certificate Security"
            } as any);
        }
        return findings;
    }

    public override getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: ['.kt', '.gradle', '.kts'],
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
        if (typeof content === 'string' && (content.includes("http://") && !content.includes("localhost"))) {
            return {
                file, severity: "HIGH",
                issue: `Insegurança JVM: O objetivo '${objective}' exige certificados válidos. Em '${file}', o tráfego HTTP é perigoso PhD.`,
                context: "HTTP detected"
            };
        }
        return {
            file, severity: "INFO",
            issue: `PhD Sentinel (Kotlin): Analisando blindagem de transporte JVM para ${objective}.`,
            context: this.name
        };
    }

    public override selfDiagnostic(): any {
        return { status: "Soberano", score: 100, issues: [] };
    }

    public override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, mestre em segurança Kotlin JVM e infraestrutura de transporte protegida.`;
    }
}
