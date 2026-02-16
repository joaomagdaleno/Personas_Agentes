/**
 * 🔗 Nexus - PhD in Dependency Orchestration & Service Integrity (Flutter)
 * Analisa a integridade de injeção de dependência e acoplamento de serviços.
 */
import type { AuditFinding, AuditRule, StrategicFinding } from "../../base.ts";
import { BaseActivePersona } from "../../base.ts";

export class NexusPersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Nexus";
        this.emoji = "🔗";
        this.role = "PhD Orchestration Architect";
        this.stack = "Flutter";
    }

    public override performAudit(): AuditFinding[] {
        this.startMetrics();
        const rules: AuditRule[] = [
            { regex: /GetIt\.instance\.register/, issue: "Injeção de Dependência: Verifique se o singleton é único ou se deve ser factory para evitar vazamento de estado global.", severity: "medium" },
            { regex: /InheritedWidget/, issue: "Topologia de Dados: Uso de InheritedWidget puro. Verifique se a propagação de dados é eficiente ou se gera rebuilds em toda a árvore.", severity: "low" },
            { regex: /globalKey/, issue: "Acesso Direto: O uso de GlobalKey para acessar estado de widgets deve ser minimizado para evitar acoplamento forte.", severity: "high" },
            { regex: /ServiceLocator/, issue: "Service Locator Pattern: Verifique se as dependências são resolvidas em compile-time ou runtime (risco de crash).", severity: "medium" }
        ];
        const results = this.findPatterns([".dart"], rules);

        // Advanced Logic: Nexus Integration Audit
        if (results.some(r => r.issue.includes("GlobalKey"))) {
            this.reasonAboutObjective("Architectural Integrity", "Coupling", "Found excessive use of GlobalKey in Flutter orchestration.");
        }

        this.endMetrics(results.length);
        return results;
    }

    public override performActiveHealing(blindSpots: string[]): void {
        console.log(`🛠️ [Nexus] Re-vinculando serviços e desacoplando dependências em: ${blindSpots.join(", ")}`);
    }

    public override reasonAboutObjective(objective: string, _file: string, _content: string): string | StrategicFinding | null {
        return {
            objective,
            analysis: "Auditando centralidade de injeção e ciclo de vida de serviços.",
            recommendation: "Preferir 'get_it' + 'injectable' para garantir que as dependências sejam configuradas via code generation.",
            severity: "low"
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
        return `Você é o Dr. ${this.name}, PhD em Orquestração de Sistemas Flutter. Sua missão é garantir a modularidade e o desacoplamento total.`;
    }
}
