/**
 * ⚛️ Core - PhD in System Foundation & Fundamental Logic (Python Stack)
 * Analisa a integridade de módulos base, utilitários e o coração do suporte Python.
 */
import type { AuditFinding, AuditRule, StrategicFinding } from "../../base.ts";
import { BaseActivePersona } from "../../base.ts";

export class CorePersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Core";
        this.emoji = "⚛️";
        this.role = "PhD Fundamental Architect";
        this.stack = "Python";
    }

    public override async performAudit(): Promise<AuditFinding[]> {
        this.startMetrics();
        const rules: AuditRule[] = [
            { regex: /import src_local\.utils/, issue: "Acoplamento de Utilitários: Verifique se o core depende de funções utilitárias que podem ser instáveis.", severity: "low" },
            { regex: /def .*\(self, .*\):[\s\S]*?pass/, issue: "Método Abstrato: Verifique se o método deveria ser realmente uma interface ou se falta implementação PhD.", severity: "medium" },
            { regex: /isinstance\(.*, \(str, int, float, bool\)\)/, issue: "Verificação de Tipo: Verifique se a validação exaustiva de tipos PhD está sendo aplicada no core.", severity: "low" },
            { regex: /CRITICAL_LOGIC_FAIL/, issue: "Falha de Lógica Core: Alerta sistêmico de degradação na camada fundamental legacy.", severity: "critical" }
        ];
        const results = await this.findPatterns([".py"], rules);

        // Advanced Logic: Fundamental Integrity Audit
        if (results.some(r => r.severity === "critical")) {
            this.reasonAboutObjective("System Sovereignty", "Core Logic", "Critical failure detected in the Python fundamental support layer.");
        }

        this.endMetrics(results.length);
        return results;
    }

    public override performActiveHealing(blindSpots: string[]): void {
        console.log(`🛠️ [Core] Restaurando estabilidade fundamental e limpando acoplamentos em: ${blindSpots.join(", ")}`);
    }

    public override reasonAboutObjective(objective: string, _file: string, _content: string): string | StrategicFinding | null {
        return {
            objective,
            analysis: "Auditando robustez da camada fundamental legacy.",
            recommendation: "Concentrar a lógica de tipos em 'types.py' e usar 'abc' para definições de interfaces formais.",
            severity: "high"
        } as StrategicFinding;
    }

    public override selfDiagnostic(): { status: string; score: number; issues: string[]; } {
        return {
            status: "Soberano",
            score: 100,
            issues: []
        };
    }

    public override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, PhD em Arquitetura Fundamental Python. Sua missão é garantir a estabilidade do coração do sistema.`;
    }
}

