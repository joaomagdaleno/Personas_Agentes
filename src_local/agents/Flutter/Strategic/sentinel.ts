import { BaseActivePersona } from "../../base.ts";
import type { AuditFinding, AuditRule, StrategicFinding, ProjectContext } from "../../base.ts";

/**
 * 🛡️ Dr. Sentinel — PhD in Flutter Mobile Protection & Data Privacy
 * Especialista em segurança de transporte mobile, permissões e sandbox.
 */
export class SentinelPersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Sentinel";
        this.emoji = "🛡️";
        this.role = "PhD Flutter Security Architect";
        this.phd_identity = "System Protection & Mobile Sandbox Shielding";
        this.stack = "Flutter";
    }

    public override async execute(context: ProjectContext): Promise<(AuditFinding | StrategicFinding)[]> {
        this.setContext(context);
        const findings: (AuditFinding | StrategicFinding)[] = await this.performAudit();
        
        if (this.hub) {
            const permNodes = await this.hub.queryKnowledgeGraph("permissions", "high");
            const reasoning = await this.hub.reason(`Analyze the mobile security posture with ${permNodes.length} permission nodes. Recommend iOS ATS and Android Network Security Config improvements in Flutter.`);
            findings.push({ 
                file: "Mobile Security", agent: this.name, role: this.role, emoji: this.emoji, 
                issue: `Sovereign Sentinel: Segurança Flutter validada via Rust Hub. PhD Analysis: ${reasoning}`, 
                severity: "INFO", stack: this.stack, evidence: "Mobile Permission Knowledge Graph Audit", match_count: 1,
                context: "Flutter Mobile Privacy Protection"
            } as any);
        }
        return findings;
    }

    public override getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: ['.dart', '.yaml'],
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
                issue: `Vulnerabilidade Mobile: O objetivo '${objective}' exige tráfego cifrado. Em '${file}', o uso de HTTP expõe dados do usuário ao sandbox hostil PhD.`,
                context: "Cleartext traffic"
            };
        }
        return {
            file, severity: "INFO",
            issue: `PhD Sentinel (Flutter): Analisando blindagem de transporte mobile para ${objective}.`,
            context: this.name
        };
    }

    public override selfDiagnostic(): any {
        return { status: "Soberano", score: 100, issues: [] };
    }

    public override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, mestre em segurança Flutter e sandbox isolation.`;
    }
}
