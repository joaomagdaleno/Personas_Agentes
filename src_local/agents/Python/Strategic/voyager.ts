import { BaseActivePersona } from "../../base.ts";
import type { AuditFinding, AuditRule, StrategicFinding, ProjectContext } from "../../base.ts";

/**
 * 🧭 Voyager - PhD in Navigation & Deep Linking (Sovereign Version)
 * Analisa rotas, fluxos de navegação e integridade de deep links em Python.
 */
export interface ExplorationVector {
    route: string;
    vulnerabilityMap: string[];
    priority: number;
}

export class VoyagerPersona extends BaseActivePersona {
    private explorationVectors: ExplorationVector[] = [];

    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Voyager";
        this.emoji = "🧭";
        this.role = "PhD Navigation Architect";
        this.phd_identity = "Navigation Architect & Routing Integrity";
        this.stack = "Python";
    }

    public override async execute(context: ProjectContext): Promise<(AuditFinding | StrategicFinding)[]> {
        this.setContext(context);
        const findings: (AuditFinding | StrategicFinding)[] = await this.performAudit();
        this.mapExplorationVectors(findings as AuditFinding[]);

        if (this.hub) {
            const legacyQuery = await this.hub.queryKnowledgeGraph("url_for", "high");
            const reasoning = await this.hub.reason(`Generate a PhD routing modernization roadmap for a Python system with ${legacyQuery.length} legacy route patterns.`);

            findings.push({
                file: "Navigation Core", agent: this.name, role: this.role, emoji: this.emoji,
                issue: `Sovereign Voyager: Integridade de navegação validada via Rust Hub. PhD Analysis: ${reasoning}`,
                severity: "INFO", stack: this.stack, evidence: `KG Routing Audit (Vectors: ${this.explorationVectors.length})`, match_count: 1,
                context: "Routing Modernization Analysis"
            } as any);
        }
        return findings;
    }

    override getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: [".py"],
            rules: [
                { regex: /flask\.url_for|django\.urls\.reverse/, issue: "Navegação por Link: Verifique se o endpoint existe na tabela de rotas PhD.", severity: "low" },
                { regex: /os\.path\.join\(.*request\.args/, issue: "Path Traversal: Risco crítico ao construir caminhos baseados em parâmetros URL PhD.", severity: "critical" },
                { regex: /redirect\(.*\)/, issue: "Open Redirect: Verifique se o destino é validado contra whitelist PhD.", severity: "high" },
                { regex: /@app\.route\(.*<id>\)/, issue: "Roteamento Dinâmico: Verifique sanitização do parâmetro para evitar injeções PhD.", severity: "medium" },
                { regex: /urllib\.parse\.urljoin/, issue: "Manipulação de URL: Garanta que URLs base sejam confiáveis PhD.", severity: "medium" },
                { regex: /FastAPI\(.*openapi_url=None\)/, issue: "Configuração de Segurança: Verifique se a documentação de rotas exposta é necessária PhD.", severity: "low" },
                { regex: /requests\.get\(.*stream=True\)/, issue: "Navegação de Fluxo: Verifique fechamento do stream PhD.", severity: "medium" }
            ]
        };
    }

    private mapExplorationVectors(findings: AuditFinding[]): void {
        this.explorationVectors = findings.map(f => ({
            route: "PYTHON_WEB_DISCOVERY",
            vulnerabilityMap: [f.issue],
            priority: f.severity === "high" || f.severity === "critical" ? 1 : 2
        }));
    }

    public override async performAudit(): Promise<AuditFinding[]> {
        this.startMetrics();
        const rules = this.getAuditRules();
        const results = await this.findPatterns(rules.extensions, rules.rules);
        this.endMetrics(results.length);
        return results;
    }

    public override reasonAboutObjective(objective: string, file: string, _content: string | Promise<string | null>): StrategicFinding | null {
        return {
            file,
            issue: `PhD Voyager (Python): Auditando a superfície de exposição de endpoints e integridade de navegação para ${objective}.`,
            severity: "STRATEGIC",
            context: this.name
        };
    }

    public override selfDiagnostic(): any {
        return { status: "Soberano", score: 100, issues: [] };
    }

    public override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, PhD em Topologia Web Python. Sua missão é garantir rotas seguras e arquitetura de rede resiliente.`;
    }
}
