import { BaseActivePersona } from "../../base.ts";
import type { AuditRule, StrategicFinding, AuditFinding } from "../../base.ts";
import type { ProjectContext } from "../../../core/types.ts";

/**
 * 🌌 Nebula Persona (Rust Stack) - PhD Cloud & Infrastructure Integrity
 * Especialista em gerência de segredos e infraestrutura de nuvem segura no ecossistema Rust.
 */
export class NebulaRustAgent extends BaseActivePersona {
    constructor(projectRoot: string | undefined = undefined) {
        super(projectRoot);
        this.id = "rust:audit:nebula";
        this.name = "Nebula";
        this.emoji = "🌌";
        this.role = "PhD Cloud Specialist";
        this.phd_identity = "Rust Cloud Security & Secret Management";
        this.stack = "Rust";
    }

    override async execute(context: ProjectContext): Promise<AuditFinding[]> {
        this.setContext(context);
        const findings = await this.performAudit();

        if (this.hub) {
            const secretsQuery = await this.hub.queryKnowledgeGraph("Secret", "critical");
            const reasoning = await this.hub.reason(`Analyze the cloud security and secrets exposure of a Rust infrastructure given ${secretsQuery.length} potential secret nodes in the graph.`);
            
            findings.push({
                file: "Cloud Security Core", agent: this.name, role: this.role, emoji: this.emoji,
                issue: `Sovereign Nebula: Segurança cloud nativa Rust validada via Hub. PhD Analysis: ${reasoning}`,
                severity: "INFO", stack: this.stack, evidence: "Knowledge Graph Secrets", match_count: 1
            } as any);
        }
        return findings;
    }

    override getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: ['.rs', 'Cargo.toml', 'Dockerfile'],
            rules: [
                { regex: /AKIA[0-9A-Z]{16}/, issue: 'Vulnerabilidade Crítica: Chave AWS exposta no código Rust.', severity: 'critical' },
                { regex: /env::var\(".*(PASSWORD|SECRET|KEY|TOKEN).*"\)/i, issue: 'Gestão de Segredo: Leitura direta de vars de ambiente com nomes sensíveis. Use AWS Secrets Manager ou equivalentes.', severity: 'medium' },
                { regex: /include_str!\(.*\.pem\)/, issue: 'Chave Hardcoded: Chave privada ou certificado SSL embutido no binário Rust via include_str!.', severity: 'critical' },
            ]
        };
    }

    override reasonAboutObjective(objective: string, file: string, _content: string | Promise<string | null>): StrategicFinding | null {
        return {
            file,
            issue: `Cloud Strategy: ${objective}`,
            context: "Native Rust Infrastructure",
            objective,
            analysis: "Auditando higiene de segredos e conectividade cloud nativa.",
            recommendation: "Assegurar que segredos em memória usem zeroize para sanitização determinística.",
            severity: "HIGH"
        };
    }

    override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, PhD em Segurança de Nuvem e Infraestrutura Rust.`;
    }
}
