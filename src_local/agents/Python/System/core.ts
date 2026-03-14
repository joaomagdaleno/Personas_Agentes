import { BaseActivePersona } from "../../base.ts";
import type { AuditFinding, AuditRule, StrategicFinding, ProjectContext } from "../../base.ts";

/**
 * ⚛️ Core - PhD in System Foundation & Fundamental Logic (Python Stack)
 * Analisa a integridade de módulos base, utilitários e o coração do suporte Python.
 */
export class CorePersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Core";
        this.emoji = "⚛️";
        this.role = "PhD Fundamental Architect";
        this.phd_identity = "System Foundation & Fundamental Logic (Python)";
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
                { regex: /import src_local\.utils/, issue: "Acoplamento de Utilitários: Verifique dependência de funções instáveis PhD.", severity: "low" },
                { regex: /def .*\(self, .*\):[\s\S]*?pass/, issue: "Método Abstrato: Verifique interface vs falta de implementação PhD.", severity: "medium" },
                { regex: /isinstance\(.*, \(str, int, float, bool\)\)/, issue: "Verificação de Tipo: Verifique validação exaustiva de tipos PhD.", severity: "low" },
                { regex: /CRITICAL_LOGIC_FAIL/, issue: "Falha de Lógica Core: Alerta sistêmico de degradação estrutural PhD.", severity: "critical" }
            ]
        };
    }

    public override async performAudit(): Promise<AuditFinding[]> {
        this.startMetrics();
        const rules = this.getAuditRules();
        const results = await this.findPatterns(rules.extensions, rules.rules);

        if (results.some(r => r.severity === "critical")) {
            results.push({
                file: "CORE_LOGIC", agent: this.name, role: this.role, emoji: this.emoji,
                issue: "System Sovereignty: Critical failure detected in the Python fundamental support layer.",
                severity: "critical", stack: this.stack, evidence: "Structural Analysis", match_count: 1, context: "Core Status"
            } as any);
        }

        this.endMetrics(results.length);
        return results;
    }

    public override reasonAboutObjective(objective: string, file: string, _content: string | Promise<string | null>): StrategicFinding | null {
        return {
            file,
            issue: `PhD Core (Python): Auditando robustez da camada fundamental legacy para ${objective}.`,
            severity: "STRATEGIC",
            context: this.name
        };
    }

    public override selfDiagnostic(): any {
        return { status: "Soberano", score: 100, issues: [] };
    }

    public override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, PhD em Arquitetura Fundamental Python. Sua missão é garantir a estabilidade do coração do sistema.`;
    }
}
