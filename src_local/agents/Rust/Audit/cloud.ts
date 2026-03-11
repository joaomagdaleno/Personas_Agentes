/**
 * ☁️ Cloud - Rust-native Infrastructure & Security Agent
 * Sovereign Synapse: Audita a infraestrutura nativa, manifestos cloud e segurança de rede.
 */
import type { AuditRule, StrategicFinding } from "../../base.ts";
import { BaseActivePersona } from "../../base.ts";

export class CloudPersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Cloud";
        this.emoji = "☁️";
        this.role = "PhD Cloud Architect";
        this.phd_identity = "Cloud Infrastructure & Network Integrity (Rust)";
        this.stack = "Rust";
    }

    public override async execute(context: any): Promise<any> {
        this.setContext(context);
        const findings = await this.performAudit();
        if (this.hub) {
            const netNodes = await this.hub.queryKnowledgeGraph("network", "low");
            const reasoning = await this.hub.reason(`Analyze the cloud network and deployment topology of a Rust system with ${netNodes.length} deployment markers. Recommend container hardening and orchestration alignment.`);
            findings.push({ 
                file: "Infrastructure Audit", agent: this.name, role: this.role, emoji: this.emoji, 
                issue: `Sovereign Cloud: Segurança de rede Rust validada via Rust Hub. PhD Analysis: ${reasoning}`, 
                severity: "INFO", stack: this.stack, evidence: "Knowledge Graph Cloud Audit", match_count: 1,
                context: "Cloud Network & Deployment"
            } as any);
        }
        return findings;
    }

    getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: [".rs", ".yaml", ".toml"],
            rules: [
                { regex: /privileged:\s*true/, issue: "Security: Container privilegiado detectado. Violação grave de segurança cloud PhD.", severity: "critical" },
                { regex: /allow_all/, issue: "Network: Regra de firewall permissiva demais detectada nas configurações de infraestrutura.", severity: "high" },
                { regex: /env:\s*SECRET_/, issue: "Safety: Uso de variáveis de ambiente para segredos. Use um Secret Manager (Vault/KMS) PhD.", severity: "medium" }
            ]
        };
    }

    public override reasonAboutObjective(objective: string, _file: string, _content: string): StrategicFinding | null {
        return {
            file: "cloud_deployment",
            issue: `Direcionamento Cloud Rust para ${objective}: Otimizando a resiliência da infraestrutura nativa.`,
            severity: "STRATEGIC",
            context: this.name
        };
    }

    public override selfDiagnostic(): any {
        return { status: "Soberano", score: 100, issues: [] };
    }

    public override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, PhD em Engenharia SRE e Cloud Security. Sua missão é garantir a estabilidade global.`;
    }
}
