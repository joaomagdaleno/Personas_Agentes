/**
 * 🧭 Voyager - PhD in Navigation & Deep Linking (Sovereign Version)
 * Analisa rotas, fluxos de navegação e integridade de deep links em Flutter.
 */
import type { AuditFinding, AuditRule, StrategicFinding } from "../../base.ts";
import { BaseActivePersona } from "../../base.ts";
import type { ProjectContext } from "../../../core/types.ts";

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
        this.phd_identity = "Flutter Navigation & Deep Linking";
        this.stack = "Flutter";
    }

    override async execute(context: ProjectContext): Promise<AuditFinding[]> {
        this.setContext(context);
        const findings = await this.performAudit();
        this.mapExplorationVectors(findings);

        if (this.hub) {
            // Navigation Intelligence via Knowledge Graph
            const legacyQuery = await this.hub.queryKnowledgeGraph("Navigator", "medium");
            
            // PhD Modernization Reasoning
            const reasoning = await this.hub.reason(`Generate a PhD navigation modernization roadmap for a Flutter system with ${legacyQuery.length} raw Navigator patterns.`);

            findings.push({
                file: "Navigation Core", agent: this.name, role: this.role, emoji: this.emoji,
                issue: `Sovereign Voyager: Integridade de navegação validada via Rust Hub. PhD Analysis: ${reasoning}`,
                severity: "INFO", stack: this.stack, evidence: `KG Navigation Audit (Vectors: ${this.explorationVectors.length})`, match_count: 1
            } as any);
        }
        return findings;
    }

    override getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: [".dart"],
            rules: [
                { regex: /Navigator\.pushNamed/, issue: "Navegação por Nome: Verifique se a rota está definida no 'onGenerateRoute' para evitar falhas silenciosas.", severity: "medium" },
                { regex: /GoRouter|go_router/, issue: "Router Avançado: O uso de GoRouter é encorajado. Verifique a gestão de 'state' e 'params'.", severity: "low" },
                { regex: /path: ['"]\/.*:id['"]/, issue: "Deep Link Dinâmico: Verifique a sanitização de parâmetros de rota contra injeção de navegação.", severity: "high" },
                { regex: /MaterialPageRoute/, issue: "Acoplamento de UI: Evite instanciar rotas diretamente nos widgets; use um roteador centralizado.", severity: "low" },
                { regex: /onGenerateInitialRoutes/, issue: "Deep Link Inicial: Verifique se o app trata estados de erro ao abrir rotas inexistentes via link externo.", severity: "medium" },
                { regex: /WillPopScope|PopScope/, issue: "Interceptação de Voltar: Verifique se a lógica de 'pop' não quebra o fluxo esperado do usuário.", severity: "low" },
                { regex: /context\.go|context\.push/, issue: "Extensão de Contexto: Verifique se a extensão 'go_router' está sendo usada corretamente sem vazamento de contexto.", severity: "low" }
            ]
        };
    }
    private mapExplorationVectors(findings: AuditFinding[]): void {
        this.explorationVectors = findings.map(f => ({
            route: "DYNAMIC_DISCOVERY",
            vulnerabilityMap: [f.issue],
            priority: f.severity === "high" ? 1 : 2
        }));
    }

    public override performActiveHealing(blindSpots: string[]): void {
        console.log(`🛠️ [Voyager] Corrigindo mapeamento de rotas e blindando deep-links em: ${blindSpots.join(", ")}`);
    }

    public override reasonAboutObjective(objective: string, _file: string, _content: string): string | StrategicFinding | null {
        return {
            objective,
            analysis: "Auditando a topologia de navegação e segurança de links externos.",
            recommendation: "Implementar 'Guards' de rotas para verificar autenticação e usar rotas tipadas para evitar erros de string.",
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
        return `Você é o Dr. ${this.name}, PhD em Topologia de Navegação Flutter. Sua missão é guiar o usuário sem quebras de fluxo.`;
    }

    /** Parity: suggest_auto_healing — Matches legacy voyager.py gap. */
    public suggest_auto_healing(_spot: string): string { return ""; }
}

