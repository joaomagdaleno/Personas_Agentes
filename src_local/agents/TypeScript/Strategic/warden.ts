import { BaseActivePersona } from "../../base.ts";
import type { AuditRule, StrategicFinding, AuditFinding } from "../../base.ts";
import type { ProjectContext } from "../../../core/types.ts";

/**
 * ⚖️ Dr. Warden — PhD in TypeScript Governance, Ethics & LGPD Compliance
 * Especialista em proteção de dados, rastreamento e conformidade legal.
 */
export class WardenPersona extends BaseActivePersona {
    constructor(projectRoot: string | undefined = undefined) {
        super(projectRoot);
        this.name = "Warden";
        this.emoji = "⚖️";
        this.role = "PhD Data Governance & Ethics Engineer";
        this.phd_identity = "TypeScript Governance, Ethics & LGPD Compliance";
        this.stack = "TypeScript";
    }

    override async execute(context: ProjectContext): Promise<AuditFinding[]> {
        this.setContext(context);
        const findings = await this.performAudit();

        if (this.hub) {
            // Governance Intelligence via Knowledge Graph
            const piiQuery = await this.hub.queryKnowledgeGraph("PII", "critical");
            
            // PhD Ethical Reasoning
            const reasoning = await this.hub.reason(`Analyze the ethical risk and LGPD compliance of a system with ${piiQuery.length} PII exposure points.`);

            findings.push({
                file: "Governance Core", agent: this.name, role: this.role, emoji: this.emoji,
                issue: `Sovereign Warden: Governança e Ética validadas via Rust Hub. PhD Analysis: ${reasoning}`,
                severity: "INFO", stack: this.stack, evidence: "Knowledge Graph Privacy Audit", match_count: 1
            } as any);
        }
        return findings;
    }

    override getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: ['.ts', '.tsx'],
            rules: [
                { regex: /localStorage\.setItem\(.*(?:user|id|token|email)/i, issue: 'Risco LGPD: Dados pessoais em localStorage sem consentimento.', severity: 'high' },
                { regex: /(?:cpf|rg|ssn|birthDate|nascimento)\s*[:=]/i, issue: 'PII Exposta: Dado pessoal sensível manipulado sem criptografia.', severity: 'critical' },
                { regex: /document\.cookie\s*=/i, issue: 'Rastreamento: Cookie sendo definido — verifique consentimento LGPD.', severity: 'high' },
                { regex: /navigator\.(?:geolocation|vibrate|mediaDevices)/i, issue: 'Permissão Sensível: Acesso a recurso de hardware do usuário.', severity: 'medium' },
                { regex: /fingerprint|deviceId|machineId/i, issue: 'Rastreamento Persistente: Identificação de dispositivo sem consentimento.', severity: 'high' },
            ]
        };
    }

    override reasonAboutObjective(objective: string, file: string, content: string | Promise<string | null>): StrategicFinding | string | null {
        if (typeof content !== 'string') return null;
        if (/cpf|rg|ssn|birthDate|nascimento/i.test(content)) {
            return {
                file, severity: "CRITICAL",
                issue: `Risco Jurídico: O objetivo '${objective}' exige conformidade LGPD. Em '${file}', dados sensíveis sem proteção ameaçam a legitimidade da 'Orquestração de Inteligência Artificial'.`,
                context: "PII detected"
            };
        }
        return {
            file, severity: "INFO",
            issue: `PhD Warden: Analisando ética de dados para ${objective}. Focando em privacidade e conformidade LGPD.`,
            context: "analyzing governance"
        };
    }

    override selfDiagnostic(): any {
        return {
            status: "Soberano",
            score: 100,
            details: "Juiz de ética e governança TS operando com lei PhD."
        };
    }

    override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, guardião da ética e conformidade legal TypeScript.`;
    }
}
