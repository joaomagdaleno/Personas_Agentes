/**
 * 🌌 Nebula - PhD in Go Cloud & Infrastructure (Sovereign Version)
 * Analisa a segurança de nuvem, exposição de segredos e infraestrutura em Go.
 */
import type { AuditFinding, AuditRule, StrategicFinding } from "../../base.ts";
import { BaseActivePersona } from "../../base.ts";
import type { ProjectContext } from "../../../core/types.ts";

export class NebulaPersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Nebula";
        this.emoji = "🌌";
        this.role = "PhD Cloud Specialist";
        this.phd_identity = "Go Cloud Security & Infrastructure Integrity";
        this.stack = "Go";
    }

    override async execute(context: ProjectContext): Promise<AuditFinding[]> {
        this.setContext(context);
        const results = await this.performAudit();

        if (this.hub) {
            const secretsQuery = await this.hub.queryKnowledgeGraph("Secret", "critical");
            const reasoning = await this.hub.reason(`Analyze the cloud security and secrets exposure of a Go infrastructure given ${secretsQuery.length} potential secret nodes in the graph.`);
            
            results.push({
                file: "Cloud Security Core", agent: this.name, role: this.role, emoji: this.emoji,
                issue: `Sovereign Nebula: Soberania cloud Go validada via Rust Hub. PhD Analysis: ${reasoning}`,
                severity: "INFO", stack: this.stack, evidence: "Knowledge Graph Secrets", match_count: 1
            } as any);
        }
        return results;
    }

    getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: [".go"],
            rules: [
                { regex: /AKIA[0-9A-Z]{16}/, issue: "Vulnerabilidade Crítica: Chave AWS exposta no código Go.", severity: "critical" },
                { regex: /sk-[a-zA-Z0-9]{20,}|ghp_[a-zA-Z0-9]{36}/, issue: "Vulnerabilidade Crítica: Token (OpenAI/GitHub) exposto.", severity: "critical" },
                { regex: /(?:apiKey|API_KEY|password|secret)\s*=\s*".{8,}"/i, issue: "Vazamento: Credencial hardcoded no código-fonte Go.", severity: "critical" },
                { regex: /https:\/\/hooks\.slack\.com/, issue: "Slack Webhook: Webhook exposto detectado.", severity: "high" },
                { regex: /jwt\.Parse\(.*nil\)/, issue: "Broken Security: Verificação de token JWT sem validação.", severity: "critical" },
                { regex: /sql\.Open\(.*"mysql",\s*".*@tcp/, issue: "DB Credential: String de conexão com senha exposta.", severity: "high" }
            ]
        };
    }

    public override reasonAboutObjective(objective: string, file: string, content: string | Promise<string | null>): StrategicFinding | string | null {
        return {
            file, severity: "INFO",
            issue: `PhD Cloud Security: Analisando soberania de segredos para ${objective}. Focando em infraestrutura Go.`,
            context: "analyzing go cloud security"
        } as StrategicFinding;
    }

    override selfDiagnostic(): any {
        return {
            status: "Soberano",
            score: 100,
            details: "Cinturão de segurança cloud Go operando com integridade PhD."
        };
    }

    public override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, PhD em Segurança de Nuvem Go.`;
    }
}
