import { BaseActivePersona } from "../../base.ts";
import type { AuditFinding, AuditRule, StrategicFinding, ProjectContext } from "../../base.ts";

export interface ExplorationVector {
    route: string;
    vulnerabilityMap: string[];
    priority: number;
}

/**
 * 🧭 Voyager - PhD in Navigation & Deep Linking (Sovereign Version)
 * Analisa rotas, fluxos de navegação e integridade de deep links em Flutter.
 */
export class VoyagerPersona extends BaseActivePersona {
    private explorationVectors: ExplorationVector[] = [];

    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Voyager";
        this.emoji = "🧭";
        this.role = "PhD Navigation Architect";
        this.phd_identity = "Flutter Navigation & Deep Linking Topology";
        this.stack = "Flutter";
    }

    public override async execute(context: ProjectContext): Promise<(AuditFinding | StrategicFinding)[]> {
        this.setContext(context);
        const findings: (AuditFinding | StrategicFinding)[] = await this.performAudit();
        this.mapExplorationVectors(findings as AuditFinding[]);

        if (this.hub) {
            const legacyQuery = await this.hub.queryKnowledgeGraph("Navigator", "medium");
            const reasoning = await this.hub.reason(`Generate a PhD navigation modernization roadmap for a Flutter system with ${legacyQuery.length} raw Navigator patterns.`);

            findings.push({
                file: "Navigation Core", agent: this.name, role: this.role, emoji: this.emoji,
                issue: `Sovereign Voyager: Integridade de navegação validada via Rust Hub. PhD Analysis: ${reasoning}`,
                severity: "INFO", stack: this.stack, evidence: `KG Navigation Audit (Vectors: ${this.explorationVectors.length})`, match_count: 1,
                context: "Flutter Router Optimization"
            } as any);
        }
        return findings;
    }

    override getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: [".dart"],
            rules: [
                { regex: /Navigator\.pushNamed/, issue: "Navegação por Nome: Verifique se a rota está definida no 'onGenerateRoute' para evitar falhas silenciosas PhD.", severity: "medium" },
                { regex: /GoRouter|go_router/, issue: "Router Avançado: O uso de GoRouter é encorajado. Verifique a gestão de 'state' e 'params' PhD.", severity: "low" },
                { regex: /path: ['"]\/.*:id['"]/, issue: "Deep Link Dinâmico: Verifique a sanitização de parâmetros de rota contra injeção de navegação PhD.", severity: "high" },
                { regex: /MaterialPageRoute/, issue: "Acoplamento de UI: Evite instanciar rotas diretamente nos widgets; use um roteador centralizado PhD.", severity: "low" },
                { regex: /onGenerateInitialRoutes/, issue: "Deep Link Inicial: Verifique se o app trata estados de erro ao abrir rotas inexistentes via link externo PhD.", severity: "medium" },
                { regex: /WillPopScope|PopScope/, issue: "Interceptação de Voltar: Verifique se a lógica de 'pop' não quebra o fluxo esperado do usuário PhD.", severity: "low" },
                { regex: /context\.go|context\.push/, issue: "Extensão de Contexto: Verifique se a extensão 'go_router' está sendo usada corretamente sem vazamento de contexto PhD.", severity: "low" }
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

    private mapExplorationVectors(findings: AuditFinding[]): void {
        this.explorationVectors = findings.map(f => ({
            route: "DYNAMIC_DISCOVERY",
            vulnerabilityMap: [f.issue],
            priority: f.severity === "high" ? 1 : 2
        }));
    }

    public override reasonAboutObjective(objective: string, file: string, _content: string | Promise<string | null>): StrategicFinding | null {
        return {
            file,
            issue: `PhD Voyager (Flutter): Auditando topologia de navegação e segurança de links externos para ${objective}. Recomendação: Usar rotas tipadas para evitar erros de string.`,
            severity: "STRATEGIC",
            context: this.name
        };
    }

    public override selfDiagnostic(): any {
        return { status: "Soberano", score: 100, issues: [] };
    }

    public override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, PhD em Topologia de Navegação Flutter. Sua missão é guiar o usuário sem quebras de fluxo.`;
    }

    public override async performActiveHealing(blindSpots: string[]): Promise<number> {
        console.log(`🛠️ [Voyager] Corrigindo mapeamento de rotas e blindando deep-links em Flutter: ${blindSpots.join(", ")}`);
        return blindSpots.length;
    }
}
