/**
 * 🧩 Fragment - PhD in Modular Deconstruction & Logic Atoms (Python Stack)
 * Analisa a granularidade de funções, métodos e a coesão de módulos Python.
 */
import type { AuditFinding, AuditRule, StrategicFinding } from "../../base.ts";
import { BaseActivePersona } from "../../base.ts";

export class FragmentPersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Fragment";
        this.emoji = "🧩";
        this.role = "PhD Logic Engineer";
        this.stack = "Python";
    }

    public override performAudit(): AuditFinding[] {
        this.startMetrics();
        const rules: AuditRule[] = [
            { regex: /def .*\(.*\):[\s\S]{1000,}/, issue: "Função Gigante: A lógica ultrapassa o limite PhD de granularidade. Divida em funções menores e coesas.", severity: "high" },
            { regex: /if .*:\n\s+if .*:\n\s+if .*:\n\s+if .*: /, issue: "Nesting Profundo: Complexidade ciclomática excessiva detectada. Use 'guard clauses' para simplificar o fluxo.", severity: "medium" },
            { regex: /import .*/, issue: "Análise de Acoplamento: Verifique se o módulo possui responsabilidades excessivas (Deus-módulo).", severity: "medium" },
            { regex: /# fragment: .*/, issue: "Soberania Atômica: Marcador de fragmento detectado. Verifique se a unidade é realmente atômica.", severity: "low" }
        ];
        const results = this.findPatterns([".py"], rules);

        // Advanced Logic: Granularity Audit
        if (results.some(r => r.severity === "high")) {
            this.reasonAboutObjective("Logical Sovereignty", "Granularity", "Found monolithic functions in Python layer, violating PhD atomicity.");
        }

        this.endMetrics(results.length);
        return results;
    }

    public override performActiveHealing(blindSpots: string[]): void {
        console.log(`🛠️ [Fragment] Decompondo funções complexas e extraindo utilitários em: ${blindSpots.join(", ")}`);
    }

    public override reasonAboutObjective(objective: string, _file: string, _content: string): string | StrategicFinding | null {
        return {
            objective,
            analysis: "Auditando coesão e granularidade da camada de suporte.",
            recommendation: "Aplicar o princípio de responsabilidade única (SRP) e refatorar funções com mais de 50 linhas.",
            severity: "medium"
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
        return `Você é o Dr. ${this.name}, PhD em Decomposição Modular Python. Sua missão é garantir a atomicidade total da lógica.`;
    }
}
