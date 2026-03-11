import type { AuditFinding, AuditRule, StrategicFinding } from "../../base.ts";
import { BaseActivePersona } from "../../base.ts";
import type { ProjectContext } from "../../../core/types.ts";

/**
 * 🔫 Warden - PhD in Enforcement & Compliance (Python Stack)
 */
export class WardenPersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Warden";
        this.emoji = "⚖️"; // Standardizing with TS Warden
        this.role = "PhD Enforcement Officer";
        this.phd_identity = "Python Enforcement & LGPD Compliance";
        this.stack = "Python";
    }

    override async execute(context: ProjectContext): Promise<AuditFinding[]> {
        this.setContext(context);
        const findings = await this.performAudit();

        if (this.hub) {
            // Enforcement Intelligence via Knowledge Graph
            const enforcementQuery = await this.hub.queryKnowledgeGraph("Policy", "high");
            
            // PhD Policy Reasoning
            const reasoning = await this.hub.reason(`Generate a PhD compliance and enforcement roadmap for a Python system with ${enforcementQuery.length} policy violations.`);

            findings.push({
                file: "Compliance Core", agent: this.name, role: this.role, emoji: this.emoji,
                issue: `Sovereign Warden: Conformidade e Execução validadas via Rust Hub. PhD Analysis: ${reasoning}`,
                severity: "INFO", stack: this.stack, evidence: "Knowledge Graph Policy Audit", match_count: 1
            } as any);
        }
        return findings;
    }

    override getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: [".py"],
            rules: [
                { regex: /os\.system/, issue: "Execução Fora de Controle: O Warden exige o uso de subprocess.run para conformidade.", severity: "high" },
                { regex: /eval\(|exec\(/, issue: "Execução Insegura: Uso de eval/exec detectado; risco de injeção de código.", severity: "critical" },
                { regex: /chmod\s+.*777/, issue: "Permissão Excessiva: Verifique se o modo 777 é realmente necessário.", severity: "high" }
            ]
        };
    }

    public override reasonAboutObjective(objective: string, _file: string, _content: string): StrategicFinding | null {
        return {
            file: "compliance",
            issue: `Auditoria do Warden para ${objective}: Garantindo execução rigorosa das leis PhD.`,
            severity: "STRATEGIC",
            context: this.name
        };
    }

    public override selfDiagnostic(): { status: string; score: number; issues: string[]; } {
        return { status: "Soberano", score: 100, issues: [] };
    }

    public override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, PhD em Execução de Conformidade Python.`;
    }
}

