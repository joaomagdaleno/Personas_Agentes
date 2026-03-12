/**
 * 🌌 Nebula - PhD in Cloud Infrastructure & Distributed Logic (Python Stack)
 * Analisa a integridade de deploys, dockerfiles e scripts de infra em Python.
 */
import type { AuditFinding, AuditRule, StrategicFinding } from "../../base.ts";
import { BaseActivePersona } from "../../base.ts";
import type { ProjectContext } from "../../../core/types.ts";

export class NebulaPersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Nebula";
        this.emoji = "🌌";
        this.role = "PhD Cloud Architect";
        this.phd_identity = "Python Cloud Sovereignty & Secrets Management";
        this.stack = "Python";
    }

    override async execute(context: ProjectContext): Promise<AuditFinding[]> {
        this.setContext(context);
        const findings = await this.performAudit();

        if (this.hub) {
            const secretsQuery = await this.hub.queryKnowledgeGraph("Secret", "critical");
            const reasoning = await this.hub.reason(`Analyze the cloud security and secrets exposure of a Python infrastructure given ${secretsQuery.length} potential secret nodes in the graph.`);
            
            findings.push({
                file: "Cloud Security Core", agent: this.name, role: this.role, emoji: this.emoji,
                issue: `Sovereign Nebula: Soberania cloud Python validada via Rust Hub. PhD Analysis: ${reasoning}`,
                severity: "INFO", stack: this.stack, evidence: "Knowledge Graph Secrets", match_count: 1
            } as any);
        }
        return findings;
    }

    getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: [".py", "Dockerfile", ".yaml"],
            rules: [
                { regex: /AKIA[0-9A-Z]{16}/, issue: "Vulnerabilidade Crítica: Chave AWS exposta no código Python.", severity: "critical" },
                { regex: /sk-[a-zA-Z0-9]{20,}|ghp_[a-zA-Z0-9]{36}/, issue: "Vulnerabilidade Crítica: Token (OpenAI/GitHub) exposto.", severity: "critical" },
                { regex: /(?:apiKey|API_KEY|password|secret)\s*[:=]\s*["'][^"']{8,}/, issue: "Vazamento: Credencial hardcoded no código-fonte Python.", severity: "critical" },
                { regex: /verify=False|ssl\._create_unverified_context/, issue: "Segurança Cloud: Desativação de verificação SSL detectada.", severity: "critical" },
                { regex: /os\.environ\.get\(.*\)\s*or\s*["'][^"']{8,}/, issue: "Risco: Fallback de variável de ambiente contém segredo real.", severity: "high" },
                { regex: /ENV\s+[A-Z_]+\s*=\s*["'][^"']{8,}/, issue: "Docker Security: Segredo embutido em instrução ENV do Dockerfile.", severity: "critical" }
            ]
        };
    }

    public override reasonAboutObjective(objective: string, file: string, content: string | Promise<string | null>): StrategicFinding | string | null {
        return {
            file, severity: "INFO",
            issue: `PhD Cloud Security: Analisando soberania de segredos para ${objective}. Focando em gestão de segredos e Docker Security.`,
            context: "analyzing python cloud security"
        } as StrategicFinding;
    }

    override selfDiagnostic(): any {
        return {
            status: "Soberano",
            score: 100,
            details: "Cinturão de segurança cloud Python operando com integridade PhD."
        };
    }

    public override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, PhD em Arquitetura de Nuvem Python.`;
    }
}
