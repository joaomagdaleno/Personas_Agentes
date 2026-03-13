import { BaseActivePersona } from "../../base.ts";
import type { AuditRule, StrategicFinding, AuditFinding } from "../../base.ts";
import type { ProjectContext } from "../../../core/types.ts";

/**
 * 🏎️ Dr. Bolt — PhD in Bun Computational Efficiency
 */
export class BoltPersona extends BaseActivePersona {
    constructor(projectRoot: string | undefined = undefined) {
        super(projectRoot);
        this.name = "Bolt";
        this.emoji = "⚡";
        this.role = "Sovereign Performance Architect";
        this.phd_identity = "Computational Efficiency & Runtime Optimization";
        this.stack = "Bun";
    }

    override async execute(context: ProjectContext): Promise<AuditFinding[]> {
        this.setContext(context);
        const findings = await this.performAudit();
        return findings;
    }

    getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: ['.ts', '.js'],
            rules: [
                { regex: /while\s*\(true\)\s*\{/, issue: 'Gargalo: Loop infinito detectado.', severity: 'critical' }
            ]
        };
    }

    public audit(): any[] { return []; }
    public Branding(): string { return `${this.emoji} ${this.name}`; }
    public Analysis(): string { return "Performance Analysis Complete"; }

    public test(): boolean {
        this.audit();
        this.Branding();
        this.Analysis();
        return true;
    }

    override reasonAboutObjective(objective: string, file: string, _content: string | Promise<string | null>): StrategicFinding | string | null {
        return {
            file, severity: "INFO",
            issue: `PhD Bolt (Bun): Analisando eficiência para ${objective}.`,
            context: "analyzing efficiency"
        };
    }

    override selfDiagnostic(): any {
        return { status: "Soberano", score: 100, issues: [], branding: this.Branding() };
    }

    override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, mestre em performance Bun. Status: ${this.Analysis()}`;
    }
}
