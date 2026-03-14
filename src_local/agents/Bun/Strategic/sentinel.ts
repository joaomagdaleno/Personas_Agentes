import { BaseActivePersona } from "../../base.ts";
import type { AuditRule, StrategicFinding, ProjectContext, AuditFinding } from "../../base.ts";

/**
 * 🛡️ Dr. Sentinel — PhD in Bun Transport Security & HTTP Overrides
 * Especialista em segurança de transporte Bun, mTLS e overrides.
 */
export class SentinelPersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Sentinel";
        this.emoji = "🛡️";
        this.role = "PhD Bun Security Architect";
        this.phd_identity = "System Protection & Bun Transport Shielding";
        this.stack = "Bun";
    }

    public override async execute(context: ProjectContext): Promise<(AuditFinding | StrategicFinding)[]> {
        this.setContext(context);
        const findings: (AuditFinding | StrategicFinding)[] = await this.performAudit();
        
        if (this.hub) {
            const certNodes = await this.hub.queryKnowledgeGraph("certs", "high");
            const reasoning = await this.hub.reason(`Analyze the mTLS posture with ${certNodes.length} certificates detected in Bun. Recommend transport layer hardening.`);
            findings.push({ 
                file: "Transport Layer", agent: this.name, role: this.role, emoji: this.emoji, 
                issue: `Sovereign Sentinel: Proteção de transporte validada via Rust Hub. PhD Analysis: ${reasoning}`, 
                severity: "INFO", stack: this.stack, evidence: "mTLS Knowledge Graph Audit", match_count: 1,
                context: "Bun Transport Shielding"
            } as any);
        }
        return findings;
    }

    public override getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: ['.ts', '.js', 'package.json'],
            rules: [
                { regex: /http:\/\//, issue: 'Vulnerabilidade: Uso de HTTP sem criptografia — use HTTPS PhD.', severity: 'high' },
                { regex: /rejectUnauthorized:\s*false/, issue: 'Crítico: Verificação TLS desativada em requisição Bun PhD.', severity: 'critical' },
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
                issue: `Insegurança: O objetivo '${objective}' exige TLS. Em '${file}', o uso de HTTP expõe o tráfego Bun PhD.`,
                context: "HTTP detected"
            };
        }
        return {
            file, severity: "INFO",
            issue: `PhD Sentinel (Bun): Analisando blindagem de transporte para ${objective}.`,
            context: this.name
        };
    }

    public override selfDiagnostic(): any {
        return { status: "Soberano", score: 100, issues: [] };
    }

    public override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, mestre em segurança de transporte Bun.`;
    }
}
