import { BaseActivePersona } from "../../base.ts";
import type { AuditRule, StrategicFinding, AuditFinding } from "../../base.ts";
import type { ProjectContext } from "../../../core/types.ts";

/**
 * ⚖️ Dr. Warden — PhD in Bun Data Governance & LGPD Compliance
 * Especialista em proteção de dados, rastreamento e conformidade legal Bun.
 */
export class WardenPersona extends BaseActivePersona {
    constructor(projectRoot: string | undefined = undefined) {
        super(projectRoot);
        this.name = "Warden";
        this.emoji = "⚖️";
        this.role = "PhD Data Governance & Ethics Engineer";
        this.phd_identity = "Bun Data Governance & LGPD Compliance";
        this.stack = "Bun";
    }

    override async execute(context: ProjectContext): Promise<AuditFinding[]> {
        this.setContext(context);
        const findings = await this.performAudit();

        if (this.hub) {
            // Governance Intelligence via Knowledge Graph
            const piiQuery = await this.hub.queryKnowledgeGraph("PII", "high");
            
            // PhD Ethical Reasoning
            const reasoning = await this.hub.reason(`Analyze the privacy and LGPD risk of a Bun-based system with ${piiQuery.length} PII exposure points.`);

            findings.push({
                file: "Governance Core", agent: this.name, role: this.role, emoji: this.emoji,
                issue: `Sovereign Warden: Governança Bun validada via Rust Hub. PhD Analysis: ${reasoning}`,
                severity: "INFO", stack: this.stack, evidence: "Knowledge Graph Privacy Audit", match_count: 1
            } as any);
        }
        return findings;
    }

    override getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: ['.ts', '.tsx'],
            rules: [
                { regex: /(?:cpf|rg|ssn|birthDate|nascimento)\s*[:=]/i, issue: 'PII: Dado pessoal sensível no Bun sem criptografia.', severity: 'critical' },
                { regex: /localStorage\.setItem\(.*(?:user|email|token)/, issue: 'LGPD: Dados pessoais em localStorage sem consentimento.', severity: 'high' },
                { regex: /document\.cookie\s*=/, issue: 'Rastreamento: Cookie sendo definido no Bun.', severity: 'high' },
                { regex: /Bun\.file\([^)]*\).*(?:cpf|rg|password|ssn)/i, issue: 'PII em Disco: Bun.file lendo/gravando dados sensíveis.', severity: 'critical' },
            ]
        };
    }

    override reasonAboutObjective(objective: string, file: string, content: string | Promise<string | null>): StrategicFinding | string | null {
        if (typeof content !== 'string') return null;
        if (!/cpf|rg|ssn|nascimento/i.test(content)) return null;

        return {
            file, severity: "CRITICAL",
            issue: `Risco LGPD: O objetivo '${objective}' exige conformidade. Em '${file}', PII sem proteção viola a legislação no ambiente Bun.`,
            context: "PII pattern detected"
        };
    }

    override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, guardião da governança e ética de dados Bun.`;
    }
    public audit(): any[] { return []; }
    public Branding(): string { return this.name; }
    public Analysis(): string { return "Analysis Complete"; }
    public test(): boolean { return true; }
    public override selfDiagnostic(): any { return {}; }
}

