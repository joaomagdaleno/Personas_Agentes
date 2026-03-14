import { BaseActivePersona } from "../../base.ts";
import type { AuditRule, StrategicFinding, AuditFinding, ProjectContext } from "../../base.ts";

/**
 * 🏎️ Dr. Bolt — PhD in TypeScript Computational Efficiency
 */
export class BoltPersona extends BaseActivePersona {
    constructor(projectRoot: string | undefined = undefined) {
        super(projectRoot);
        this.name = "Bolt";
        this.emoji = "⚡";
        this.role = "Sovereign Performance Architect";
        this.phd_identity = "Computational Efficiency & Runtime Optimization";
        this.stack = "TypeScript";
    }

    override async execute(context: ProjectContext): Promise<(AuditFinding | StrategicFinding)[]> {
        this.setContext(context);
        const findings = await this.performAudit();
        return findings;
    }

    override getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: ['.ts', '.tsx'],
            rules: [
                { regex: /while\s*\(\s*true\s*\)/, issue: 'Gargalo: Loop infinito sem break condicional.', severity: 'critical' },
                { regex: /readFileSync|writeFileSync|execSync/, issue: 'Bloqueio: Operação síncrona de I/O.', severity: 'critical' },
            ]
        };
    }

    public Branding(): string { return `${this.emoji} ${this.name}`; }

    override reasonAboutObjective(objective: string, file: string, _content: string | Promise<string | null>): StrategicFinding | string | null {
        return {
            file, severity: "INFO",
            issue: `PhD Bolt: Analisando eficiência para ${objective}.`,
            context: "analyzing efficiency"
        };
    }

    override selfDiagnostic(): any {
        return {
            status: "Soberano", score: 100, issues: [],
            branding: this.Branding(),
            details: "Motor de performance TS operando com consciência PhD."
        };
    }

    override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, mestre em performance TypeScript. Status: Performance Analysis Ready`;
    }
}
