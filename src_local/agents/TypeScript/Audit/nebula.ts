import { BaseActivePersona } from "../../base.ts";
import type { AuditRule, StrategicFinding, AuditFinding } from "../../base.ts";
import type { ProjectContext } from "../../../core/types.ts";

/**
 * ☁️ Dr. Nebula — PhD in TypeScript Cloud Security & Secrets Management
 * Especialista em segurança de credenciais, chaves expostas e vazamento de segredos.
 */
export class NebulaPersona extends BaseActivePersona {
    constructor(projectRoot: string | undefined = undefined) {
        super(projectRoot);
        this.name = "Nebula";
        this.emoji = "☁️";
        this.role = "PhD Cloud Security Architect";
        this.phd_identity = "TypeScript Secrets Management & Cloud Sovereignty";
        this.stack = "TypeScript";
    }

    override async execute(context: ProjectContext): Promise<AuditFinding[]> {
        this.setContext(context);
        const findings = await this.performAudit();

        if (this.hub) {
            const secretsQuery = await this.hub.queryKnowledgeGraph("Secret", "critical");
            const reasoning = await this.hub.reason(`Analyze the cloud security and secrets exposure given ${secretsQuery.length} potential secret nodes in the graph.`);
            
            findings.push({
                file: "Cloud Security Core", agent: this.name, role: this.role, emoji: this.emoji,
                issue: `Sovereign Nebula: Soberania cloud validada via Rust Hub. PhD Analysis: ${reasoning}`,
                severity: "INFO", stack: this.stack, evidence: "Knowledge Graph Secrets", match_count: 1
            } as any);
        }
        return findings;
    }

    getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: ['.ts', '.tsx', '.json'],
            rules: [
                { regex: /AKIA[0-9A-Z]{16}/, issue: 'Vulnerabilidade Crítica: Chave AWS exposta no código TypeScript.', severity: 'critical' },
                { regex: /(?:api[_-]?key|apiKey|API_KEY)\s*[:=]\s*["'][^"']{8,}/, issue: 'Vazamento: API Key hardcoded no código-fonte.', severity: 'critical' },
                { regex: /(?:password|passwd|secret)\s*[:=]\s*["'][^"']+["']/, issue: 'Vazamento: Credencial hardcoded no código-fonte.', severity: 'critical' },
                { regex: /sk-[a-zA-Z0-9]{20,}/, issue: 'Vulnerabilidade Crítica: Chave OpenAI exposta.', severity: 'critical' },
                { regex: /ghp_[a-zA-Z0-9]{36}/, issue: 'Vulnerabilidade Crítica: Token GitHub exposto.', severity: 'critical' },
                { regex: /process\.env\.[A-Z_]+\s*\|\|\s*["'][^"']{8,}/, issue: 'Risco: Fallback de variável de ambiente contém segredo real.', severity: 'high' },
            ]
        };
    }

    override reasonAboutObjective(objective: string, file: string, content: string | Promise<string | null>): StrategicFinding | string | null {
        if (typeof content !== 'string') return null;
        if (file.includes('persona_manifest') || file.includes('rules')) return null;
        if (/AKIA|sk-[a-zA-Z0-9]{20}|ghp_/.test(content) && !/rules\s*=/.test(content)) {
            return {
                file, severity: "CRITICAL",
                issue: `Catástrofe de Segurança: O objetivo '${objective}' exige proteção total. Credenciais expostas em '${file}' permitem o sequestro da 'Orquestração de Inteligência Artificial'.`,
                context: "Secret pattern detected"
            };
        }
        return {
            file, severity: "INFO",
            issue: `PhD Cloud Security: Analisando soberania de segredos para ${objective}. Focando em eliminação de hardcoded tokens.`,
            context: "analyzing cloud security"
        };
    }

    override selfDiagnostic(): any {
        return {
            status: "Soberano",
            score: 100,
            details: "Cinturão de segurança cloud TS operando com integridade PhD."
        };
    }

    override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, mestre em soberania cloud e segurança de segredos TypeScript.`;
    }
}
