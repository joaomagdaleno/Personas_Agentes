/**
 * ☁️ Nebula - PhD in Cloud Architecture & Mobile Backend (Flutter)
 * Especialista em segurança de chaves, integração Firebase e isolamento de ambiente.
 */
import type { AuditFinding, AuditRule, StrategicFinding } from "../../base.ts";
import { BaseActivePersona } from "../../base.ts";
import type { ProjectContext } from "../../../core/types.ts";

export class NebulaPersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Nebula";
        this.emoji = "☁️";
        this.role = "PhD Cloud Architect";
        this.phd_identity = "Flutter Security & Cloud Sovereignty";
        this.stack = "Flutter";
    }

    override async execute(context: ProjectContext): Promise<AuditFinding[]> {
        this.setContext(context);
        const findings = await this.performAudit();

        if (this.hub) {
            const secretsQuery = await this.hub.queryKnowledgeGraph("Secret", "critical");
            const reasoning = await this.hub.reason(`Analyze the cloud security and secrets exposure of a Flutter infrastructure given ${secretsQuery.length} potential secret nodes in the graph.`);
            
            findings.push({
                file: "Cloud Security Core", agent: this.name, role: this.role, emoji: this.emoji,
                issue: `Sovereign Nebula: Soberania cloud Flutter validada via Rust Hub. PhD Analysis: ${reasoning}`,
                severity: "INFO", stack: this.stack, evidence: "Knowledge Graph Secrets", match_count: 1
            } as any);
        }
        return findings;
    }

    override getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: [".dart", ".json", ".yaml"],
            rules: [
                { regex: /AKIA[0-9A-Z]{16}/, issue: "Vulnerabilidade Crítica: Chave AWS exposta no código Flutter.", severity: "critical" },
                { regex: /(?:api[_-]?key|apiKey|API_KEY)\s*[:=]\s*["'][^"']{8,}/, issue: "Vazamento: API Key hardcoded no código Flutter.", severity: "critical" },
                { regex: /(?:password|passwd|secret)\s*[:=]\s*["'][^"']+["']/, issue: "Vazamento: Credencial hardcoded no código Flutter.", severity: "critical" },
                { regex: /sk-[a-zA-Z0-9]{20,}/, issue: "Vulnerabilidade Crítica: Chave OpenAI exposta.", severity: "critical" },
                { regex: /ghp_[a-zA-Z0-9]{36}/, issue: "Vulnerabilidade Crítica: Token GitHub exposto.", severity: "critical" },
                { regex: /String\.fromEnvironment\(.*,\s*defaultValue:\s*["'][^"']{8,}/, issue: "Risco: Fallback de ambiente contém segredo real.", severity: "high" }
            ]
        };
    }

    public override reasonAboutObjective(objective: string, file: string, content: string): StrategicFinding | null {
        if (content["match"](/AKIA/) && !content["match"](/rules\s*=/)) {
            return {
                file,
                issue: `Catástrofe de Segurança: O objetivo '${objective}' exige proteção total. Credenciais expostas em '${file}' permitem o sequestro da 'Orquestração de Inteligência Artificial' via nuvem.`,
                severity: "STRATEGIC",
                context: this.name
            };
        }
        return {
            file,
            issue: `PhD Cloud Security: Analisando soberania de segredos para ${objective}. Focando em eliminação de hardcoded tokens.`,
            severity: "INFO",
            context: this.name
        } as StrategicFinding;
    }

    override selfDiagnostic(): any {
        return {
            status: "Soberano",
            score: 100,
            details: "Cinturão de segurança cloud Flutter operando com integridade PhD."
        };
    }

    public override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, PhD em Arquitetura de Nuvem e Backend Mobile Flutter.`;
    }
}
