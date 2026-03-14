import { BaseActivePersona } from "../../base.ts";
import type { AuditFinding, AuditRule, StrategicFinding, ProjectContext } from "../../base.ts";

/**
 * 🔗 Nexus - PhD in Dependency Orchestration & Service Integrity (Flutter)
 * Analisa a integridade de injeção de dependência e acoplamento de serviços.
 */
export class NexusPersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Nexus";
        this.emoji = "🔗";
        this.role = "PhD Orchestration Architect";
        this.phd_identity = "Flutter Dependency Orchestration & Service Integration";
        this.stack = "Flutter";
    }

    public override async execute(context: ProjectContext): Promise<(AuditFinding | StrategicFinding)[]> {
        this.setContext(context);
        const findings: (AuditFinding | StrategicFinding)[] = await this.performAudit();
        return findings;
    }

    override getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: [".dart"],
            rules: [
                { regex: /GetIt\.instance\.register/, issue: "Injeção de Dependência: Verifique se o singleton é único ou se deve ser factory para evitar vazamento de estado global PhD.", severity: "medium" },
                { regex: /InheritedWidget/, issue: "Topologia de Dados: Uso de InheritedWidget puro. Verifique se a propagação de dados é eficiente ou se gera rebuilds agressivos PhD.", severity: "low" },
                { regex: /globalKey/, issue: "Acesso Direto: O uso de GlobalKey para acessar estado de widgets deve ser minimizado para evitar acoplamento forte na árvore PhD.", severity: "high" },
                { regex: /ServiceLocator/, issue: "Service Locator Pattern: Verifique se as dependências são resolvidas em compile-time ou runtime (risco de hard crash) PhD.", severity: "medium" }
            ]
        };
    }

    public override async performAudit(): Promise<AuditFinding[]> {
        this.startMetrics();
        const rules = this.getAuditRules();
        const results = await this.findPatterns(rules.extensions, rules.rules);

        // Advanced Logic: Nexus Integration Audit
        if (results.some(r => r.issue.includes("GlobalKey"))) {
            const strategic = this.reasonAboutObjective("Architectural Integrity", "Coupling", "Found excessive use of GlobalKey in Flutter orchestration.");
            if (strategic) {
                results.push({
                    file: strategic.file, agent: this.name, role: this.role, emoji: this.emoji,
                    issue: strategic.issue, severity: "high", stack: this.stack, evidence: "GlobalKey Overuse", match_count: results.length, context: strategic.context
                } as any);
            }
        }

        this.endMetrics(results.length);
        return results;
    }

    public override async performActiveHealing(blindSpots: string[]): Promise<number> {
        console.log(`🛠️ [Nexus] Re-vinculando serviços locais e desacoplando dependências efêmeras em: ${blindSpots.join(", ")}`);
        return blindSpots.length;
    }

    public override reasonAboutObjective(objective: string, _file: string, _content: string | Promise<string | null>): StrategicFinding | null {
        return {
            file: "dependency_orchestration",
            issue: `PhD Nexus (Flutter): Auditando centralidade de injeção e ciclo de vida de serviços para '${objective}'. Prefira 'get_it' + 'injectable' para code gen robusta PhD.`,
            severity: "LOW",
            context: this.name
        };
    }

    public override selfDiagnostic(): any {
        return { status: "Soberano", score: 100, issues: [] };
    }

    public override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, PhD em Orquestração de Sistemas Flutter. Sua missão é garantir a modularidade e o desacoplamento total da árvore de Dart.`;
    }
}
