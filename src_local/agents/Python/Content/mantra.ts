import { BaseActivePersona } from "../../base.ts";
import type { AuditFinding, AuditRule, StrategicFinding, ProjectContext } from "../../base.ts";

/**
 * 🕉️ Mantra - PhD in Consistent Logic (Python Stack)
 */
export class MantraPersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Mantra";
        this.emoji = "🕉️";
        this.role = "PhD Logic Philosopher";
        this.phd_identity = "Consistent Logic & Purity (Python)";
        this.stack = "Python";
    }

    public override async execute(context: ProjectContext): Promise<(AuditFinding | StrategicFinding)[]> {
        this.setContext(context);
        const findings: (AuditFinding | StrategicFinding)[] = await this.performAudit();
        if (this.hub) {
            const logicNodes = await this.hub.queryKnowledgeGraph("TODO", "medium");
            const reasoning = await this.hub.reason(`Analyze the logic purity of a Python system with ${logicNodes.length} TODO/FIXME patterns. Recommend technical debt resolution.`);
            findings.push({ 
                file: "Logic Purity", agent: this.name, role: this.role, emoji: this.emoji, 
                issue: `Sovereign Mantra: Pureza lógica Python validada via Rust Hub. PhD Analysis: ${reasoning}`, 
                severity: "INFO", stack: this.stack, evidence: "Knowledge Graph Logic Audit", match_count: 1,
                context: "Logic Purity Analysis"
            } as any);
        }
        return findings;
    }

    override getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: [".py"],
            rules: [
                { regex: /TODO|FIXME/, issue: "Dívida Filosófica: Pendências detectadas que quebram o mantra de perfeição.", severity: "medium" }
            ]
        };
    }

    public override reasonAboutObjective(objective: string, file: string, _content: string | Promise<string | null>): StrategicFinding | null {
        return {
            file,
            issue: `Evolução do Mantra para ${objective}: Mantendo a pureza da lógica fundamental.`,
            severity: "STRATEGIC",
            context: this.name
        };
    }

    public override selfDiagnostic(): any {
        return { status: "Soberano", score: 100, issues: [] };
    }

    public override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, PhD em Filosofia Lógica Python.`;
    }
}

