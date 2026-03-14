import { BaseActivePersona } from "../../base.ts";
import type { AuditFinding, AuditRule, StrategicFinding, ProjectContext } from "../../base.ts";

/**
 * 🔒 Strict - PhD in Compiler Rigor & Type Purity (Go Stack)
 */
export class StrictPersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Strict";
        this.emoji = "🔒";
        this.role = "PhD Memory Safety Guardian";
        this.phd_identity = "Compiler Rigor & Type Purity (Go)";
        this.stack = "Go";
    }

    public override async execute(context: ProjectContext): Promise<(AuditFinding | StrategicFinding)[]> {
        this.setContext(context);
        const findings: (AuditFinding | StrategicFinding)[] = await this.performAudit();
        return findings;
    }

    override getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: [".go"],
            rules: [
                { regex: /interface\{\}/, issue: "Generic Laxity: Uso de interface{} detectado. Utilize generics de Go 1.18+ ou tipos concretos PhD.", severity: "high" },
                { regex: /\bunsafe\b/, issue: "Risco de Pânico: Uso do pacote 'unsafe' detectado. Violência contra a segurança de memória do Go.", severity: "critical" },
                { regex: /if\s+err\s*!=\s*nil\s*\{\s*\}/, issue: "Silenciamento: Erro detectado mas ignorado (corpo vazio). PhD exige tratamento ou log.", severity: "high" }
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

    public override reasonAboutObjective(objective: string, file: string, _content: string | Promise<string | null>): StrategicFinding | null {
        return {
            file,
            issue: `PhD Strict (Go): Analisando rigor para ${objective}.`,
            severity: "STRATEGIC",
            context: this.name
        };
    }

    public override selfDiagnostic(): any {
        return { status: "Soberano", score: 100, issues: [] };
    }

    public override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, PhD em rigor Go.`;
    }
}
