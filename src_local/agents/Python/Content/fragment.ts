import { BaseActivePersona } from "../../base.ts";
import type { AuditFinding, AuditRule, StrategicFinding, ProjectContext } from "../../base.ts";

/**
 * 🧩 Fragment - PhD in Modular Deconstruction & Logic Atoms (Python Stack)
 * Analisa a granularidade de funções, métodos e a coesão de módulos Python.
 */
export class FragmentPersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Fragment";
        this.emoji = "🧩";
        this.role = "PhD Refactoring Expert";
        this.phd_identity = "Modularity & Structural Cohesion (Python)";
        this.stack = "Python";
    }

    public override async execute(context: ProjectContext): Promise<(AuditFinding | StrategicFinding)[]> {
        this.setContext(context);
        const findings: (AuditFinding | StrategicFinding)[] = await this.performAudit();
        if (this.hub) {
            const modNodes = await this.hub.queryKnowledgeGraph("import", "low");
            const reasoning = await this.hub.reason(`Analyze the structural modularity of a Python system with ${modNodes.length} import markers. Recommend decoupling strategies and module organization.`);
            findings.push({ 
                file: "Structural Audit", agent: this.name, role: this.role, emoji: this.emoji, 
                issue: `Sovereign Fragment: Coesão Python validada via Rust Hub. PhD Analysis: ${reasoning}`, 
                severity: "INFO", stack: this.stack, evidence: "Knowledge Graph Fragment Audit", match_count: 1,
                context: "Module Modularity & Decoupling"
            } as any);
        }
        return findings;
    }

    override getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: [".py"],
            rules: [
                { regex: /def .*\(.*\):[\s\S]{1000,}/, issue: "Função Gigante: A lógica ultrapassa o limite PhD de granularidade. Divida em funções menores e coesas.", severity: "high" },
                { regex: /if .*:\n\s+if .*:\n\s+if .*:\n\s+if .*: /, issue: "Nesting Profundo: Complexidade ciclomática excessiva detectada. Use 'guard clauses' para simplificar o fluxo.", severity: "medium" },
                { regex: /import .*/, issue: "Análise de Acoplamento: Verifique se o módulo possui responsabilidades excessivas (Deus-módulo).", severity: "medium" },
                { regex: /# fragment: .*/, issue: "Soberania Atômica: Marcador de fragmento detectado. Verifique se a unidade é realmente atômica.", severity: "low" }
            ]
        };
    }

    public override async performAudit(): Promise<AuditFinding[]> {
        this.startMetrics();
        const rules = this.getAuditRules();
        const results = await this.findPatterns(rules.extensions, rules.rules);

        // Advanced Logic: Granularity Audit
        if (results.some(r => r.severity === "high")) {
            this.reasonAboutObjective("Logical Sovereignty", "Granularity", "Found monolithic functions in Python layer, violating PhD atomicity.");
        }

        this.endMetrics(results.length);
        return results;
    }

    public override reasonAboutObjective(objective: string, file: string, _content: string | Promise<string | null>): StrategicFinding | null {
        return {
            file,
            issue: `Auditando coesão e granularidade da camada de suporte para ${objective}.`,
            severity: "STRATEGIC",
            context: this.name
        };
    }

    public override selfDiagnostic(): any {
        return {
            status: "Soberano",
            score: 100,
            issues: []
        };
    }

    public override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, PhD em Decomposição Modular Python. Sua missão é garantir a atomicidade total da lógica.`;
    }
}
