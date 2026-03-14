import { BaseActivePersona } from "../../base.ts";
import type { AuditFinding, AuditRule, StrategicFinding, ProjectContext } from "../../base.ts";

/**
 * ⚖️ Dr. Warden — PhD in Bun Data Governance & LGPD Compliance
 * Especialista em proteção de dados, rastreamento e conformidade legal Bun.
 */
export class WardenPersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Warden";
        this.emoji = "⚖️";
        this.role = "PhD Data Governance & Ethics Engineer";
        this.phd_identity = "Bun Data Governance & LGPD Compliance";
        this.stack = "Bun";
    }

    public override async execute(context: ProjectContext): Promise<(AuditFinding | StrategicFinding)[]> {
        this.setContext(context);
        const findings: (AuditFinding | StrategicFinding)[] = await this.performAudit();

        if (this.hub) {
            const piiQuery = await this.hub.queryKnowledgeGraph("PII", "high");
            const reasoning = await this.hub.reason(`Analyze the privacy and LGPD risk of a Bun-based system with ${piiQuery.length} PII exposure points.`);

            findings.push({
                file: "Governance Core", agent: this.name, role: this.role, emoji: this.emoji,
                issue: `Sovereign Warden: Governança Bun validada via Rust Hub. PhD Analysis: ${reasoning}`,
                severity: "INFO", stack: this.stack, evidence: "Knowledge Graph Privacy Audit", match_count: 1,
                context: "Bun Governance Audit"
            } as any);
        }
        return findings;
    }

    override getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: ['.ts', '.tsx', '.json'],
            rules: [
                { regex: /(?:cpf|rg|ssn|birthDate|nascimento)\s*[:=]/i, issue: 'PII: Dado pessoal sensível no Bun sem criptografia PhD.', severity: 'critical' },
                { regex: /localStorage\.setItem\(.*(?:user|email|token)/, issue: 'LGPD: Dados pessoais em localStorage sem consentimento PhD.', severity: 'high' },
                { regex: /document\.cookie\s*=/, issue: 'Rastreamento: Cookie sendo definido no Bun PhD.', severity: 'high' },
                { regex: /Bun\.file\([^)]*\).*(?:cpf|rg|password|ssn)/i, issue: 'PII em Disco: Bun.file lendo/gravando dados sensíveis PhD.', severity: 'critical' },
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
        if (typeof content === 'string' && /cpf|rg|ssn|nascimento/i.test(content)) {
            return {
                file, severity: "CRITICAL",
                issue: `Risco LGPD: O objetivo '${objective}' exige conformidade. Em '${file}', PII sem proteção viola a legislação no ambiente Bun PhD.`,
                context: "PII pattern detected"
            };
        }
        return {
            file, severity: "INFO",
            issue: `PhD Warden (Bun): Analisando conformidade e ética de dados para ${objective}.`,
            context: this.name
        };
    }

    public override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, guardião da governança e ética de dados Bun.`;
    }
    
    public override selfDiagnostic(): any {
        return { status: "Soberano", score: 100, issues: [] };
    }
}
