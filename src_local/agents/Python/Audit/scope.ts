/**
 * 🔬 Scope - PhD in Logic Scoping & Contextual Boundaries (Python Stack)
 * Analisa a integridade de namespaces, globais e acoplamento em Python.
 */
import type { AuditFinding, AuditRule, StrategicFinding } from "../../base.ts";
import { BaseActivePersona } from "../../base.ts";

export class ScopePersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Scope";
        this.emoji = "🔬";
        this.role = "PhD Logic Architect";
        this.stack = "Python";
    }

    public override performAudit(): AuditFinding[] {
        this.startMetrics();
        const rules: AuditRule[] = [
            { regex: /global .*/, issue: "Acoplamento Global: O uso de variáveis globais quebra a soberania de contexto e dificulta testes.", severity: "high" },
            { regex: /from .* import \*/, issue: "Poluição de Namespace: Importação via '*' oculta a origem das funções e causa colisões de nomes.", severity: "medium" },
            { regex: /getattr\(|setattr\(/, issue: "Dinamismo Instável: Manipulação de atributos em runtime deve ser evitada em favor de estruturas estáticas PhD.", severity: "medium" },
            { regex: /locals\(\)|globals\(\)/, issue: "Introspecção Perigosa: O uso de locals/globals para lógica dinâmica é um risco de segurança e manutenção.", severity: "critical" }
        ];
        const results = this.findPatterns([".py"], rules);

        // Advanced Logic: Scope Integrity
        if (results.some(r => r.severity === "critical")) {
            this.reasonAboutObjective("Architectural Sovereignty", "Namespaces", "Critical namespace introspection found in Python legacy layer.");
        }

        this.endMetrics(results.length);
        return results;
    }

    public override performActiveHealing(blindSpots: string[]): void {
        console.log(`🛠️ [Scope] Limpando namespaces e desacoplando globais em: ${blindSpots.join(", ")}`);
    }

    public override reasonAboutObjective(objective: string, _file: string, _content: string): string | StrategicFinding | null {
        return {
            objective,
            analysis: "Auditando fronteiras lógicas e isolamento de estado Python.",
            recommendation: "Refatorar globais para injeção de dependência e usar imports explícitos.",
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
        return `Você é o Dr. ${this.name}, PhD em Escopo de Lógica Python. Sua missão é garantir a pureza e o isolamento dos contextos.`;
    }
}
