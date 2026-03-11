import { BaseActivePersona } from "../../base.ts";
import type { AuditRule, StrategicFinding, AuditFinding } from "../../base.ts";
import type { ProjectContext } from "../../../core/types.ts";

/**
 * ☁️ Dr. Nebula — PhD in Bun Security & Secrets Management
 * Especialista em Bun.password, segurança de hashing e proteção de credenciais.
 */
export class NebulaPersona extends BaseActivePersona {
    constructor(projectRoot: string | undefined = undefined) {
        super(projectRoot);
        this.name = "Nebula";
        this.emoji = "☁️";
        this.role = "PhD Bun Security Architect";
        this.phd_identity = "Bun Security & Secrets Management";
        this.stack = "Bun";
    }

    override async execute(context: ProjectContext): Promise<AuditFinding[]> {
        this.setContext(context);
        const findings = await this.performAudit();

        if (this.hub) {
            const secretsQuery = await this.hub.queryKnowledgeGraph("Secret", "critical");
            const reasoning = await this.hub.reason(`Analyze the cloud security and secrets exposure of a Bun infrastructure given ${secretsQuery.length} potential secret nodes in the graph.`);
            
            findings.push({
                file: "Cloud Security Core", agent: this.name, role: this.role, emoji: this.emoji,
                issue: `Sovereign Nebula: Soberania cloud Bun validada via Rust Hub. PhD Analysis: ${reasoning}`,
                severity: "INFO", stack: this.stack, evidence: "Knowledge Graph Secrets", match_count: 1
            } as any);
        }
        return findings;
    }

    override getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: ['.ts', '.tsx', '.json'],
            rules: [
                { regex: /AKIA[0-9A-Z]{16}/, issue: 'Vulnerabilidade Crítica: Chave AWS exposta no código Bun.', severity: 'critical' },
                { regex: /sk-[a-zA-Z0-9]{20,}|ghp_[a-zA-Z0-9]{36}/, issue: 'Vulnerabilidade Crítica: Token (OpenAI/GitHub) exposto.', severity: 'critical' },
                { regex: /(?:apiKey|API_KEY|password|secret)\s*[:=]\s*["'][^"']{8,}/, issue: 'Vazamento: Credencial hardcoded no código-fonte Bun.', severity: 'critical' },
                { regex: /bcrypt|crypto\.createHash/, issue: 'Polyfill: Use Bun.password.hash() nativo para soberania de hashing.', severity: 'medium' },
                { regex: /Bun\.env\.[A-Z_]+(?!.*\?\?|.*\|\||.*throw)/, issue: 'Frágil: Acesso direto a Bun.env sem fallback de segurança.', severity: 'high' },
                { regex: /(?:process\.env|Bun\.env)\.[A-Z_]+\s*\|\|\s*["'][^"']{8,}/, issue: 'Risco: Fallback de variável de ambiente contém segredo real.', severity: 'high' },
            ]
        };
    }

    override reasonAboutObjective(objective: string, file: string, content: string | Promise<string | null>): StrategicFinding | string | null {
        if (typeof content !== 'string') return null;
        if (file.includes('persona_manifest')) return null;

        if (/AKIA|sk-[a-zA-Z0-9]{20}|ghp_/.test(content) && !/rules\s*=/.test(content)) {
            return {
                file, severity: "CRITICAL",
                issue: `Catástrofe de Segurança: O objetivo '${objective}' exige proteção total. Credenciais expostas em '${file}' permitem o sequestro da 'Orquestração de Inteligência Artificial'.`,
                context: "sensitive credential pattern detected"
            };
        }
        return null;
    }

    override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, mestre em segurança e proteção de segredos Bun.`;
    }
}
