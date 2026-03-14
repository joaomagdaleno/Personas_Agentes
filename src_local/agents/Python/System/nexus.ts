import { BaseActivePersona } from "../../base.ts";
import type { AuditFinding, AuditRule, StrategicFinding, ProjectContext } from "../../base.ts";

/**
 * 🔗 Nexus - PhD in Dependency Orchestration & Service Integrity (Python Stack)
 * Analisa a integridade de injeção de dependência e acoplamento entre serviços legacy.
 */
export class NexusPersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Nexus";
        this.emoji = "🔗";
        this.role = "PhD Orchestration Architect";
        this.phd_identity = "Dependency Orchestration & Service Integrity (Python)";
        this.stack = "Python";
    }

    public override async execute(context: ProjectContext): Promise<(AuditFinding | StrategicFinding)[]> {
        this.setContext(context);
        const findings: (AuditFinding | StrategicFinding)[] = await this.performAudit();
        return findings;
    }

    override getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: [".py"],
            rules: [
                { regex: /import src_local\..*/, issue: "Acoplamento Interno: Verifique dependências modulares PhD.", severity: "low" },
                { regex: /sys\.modules\[.*\] = .*/, issue: "Injeção Dinâmica: Manipular sys.modules é risco crítico PhD.", severity: "critical" },
                { regex: /injector\.get\(.*\)/, issue: "Service Locator: Verifique injeção via 'dependency_injector' PhD.", severity: "medium" },
                { regex: /circular import/, issue: "Dependência Circular: Permite desacoplamento para evitar falhas PhD.", severity: "high" }
            ]
        };
    }

    public override async performAudit(): Promise<AuditFinding[]> {
        this.startMetrics();
        const rules = this.getAuditRules();
        const results = await this.findPatterns(rules.extensions, rules.rules);

        if (results.some(r => r.severity === "critical")) {
            results.push({
                file: "PYTHON_NEXUS", agent: this.name, role: this.role, emoji: this.emoji,
                issue: "Architectural Integrity: Critical dynamic module injection found.",
                severity: "critical", stack: this.stack, evidence: "Structural Analysis", match_count: 1, context: "DI Audit"
            } as any);
        }

        this.endMetrics(results.length);
        return results;
    }

    public override reasonAboutObjective(objective: string, file: string, _content: string | Promise<string | null>): StrategicFinding | null {
        return {
            file,
            issue: `PhD Nexus (Python): Auditando centralidade de injeção e serviços legacy para ${objective}.`,
            severity: "STRATEGIC",
            context: this.name
        };
    }

    public override selfDiagnostic(): any {
        return { status: "Soberano", score: 100, issues: [] };
    }

    public override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, PhD em Orquestração de Sistemas Python.`;
    }
}
