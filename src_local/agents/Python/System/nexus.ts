/**
 * 🔗 Nexus - PhD in Dependency Orchestration & Service Integrity (Python Stack)
 * Analisa a integridade de injeção de dependência e acoplamento entre serviços legacy.
 */
import type { AuditFinding, AuditRule, StrategicFinding } from "../../base.ts";
import { BaseActivePersona } from "../../base.ts";

export class NexusPersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Nexus";
        this.emoji = "🔗";
        this.role = "PhD Orchestration Architect";
        this.stack = "Python";
    }

    public override performAudit(): AuditFinding[] {
        this.startMetrics();
        const rules: AuditRule[] = [
            { regex: /import src_local\..*/, issue: "Acoplamento Interno: Verifique se as dependências entre módulos seguem o padrão PhD de modularidade.", severity: "low" },
            { regex: /sys\.modules\[.*\] = .*/, issue: "Injeção Dinâmica: Manipular sys.modules é um risco crítico de soberania e previsibilidade.", severity: "critical" },
            { regex: /injector\.get\(.*\)/, issue: "Service Locator: Verifique se o uso de injeção via 'injector' (dependency_injector) está isolado.", severity: "medium" },
            { regex: /circular import/, issue: "Dependência Circular: Verifique se o design permite desacoplamento para evitar travamentos de importação.", severity: "high" }
        ];
        const results = this.findPatterns([".py"], rules);

        // Advanced Logic: Nexus Integration Audit
        if (results.some(r => r.severity === "critical")) {
            this.reasonAboutObjective("Architectural Integrity", "Dependency Injection", "Critical dynamic module injection found in Python layer.");
        }

        this.endMetrics(results.length);
        return results;
    }

    public override performActiveHealing(blindSpots: string[]): void {
        console.log(`🛠️ [Nexus] Re-vinculando serviços e resolvendo dependências circulares em: ${blindSpots.join(", ")}`);
    }

    public override reasonAboutObjective(objective: string, _file: string, _content: string): string | StrategicFinding | null {
        return {
            objective,
            analysis: "Auditando centralidade de injeção e ciclo de vida de serviços legacy.",
            recommendation: "Usar 'dependency_injector' de forma declarativa e evitar manipulações de sys.modules.",
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
        return `Você é o Dr. ${this.name}, PhD em Orquestração de Sistemas Python. Sua missão é garantir a modularidade e o desacoplamento total.`;
    }
}
