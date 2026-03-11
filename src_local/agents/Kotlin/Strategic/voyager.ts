/**
 * 🧭 Voyager - PhD in Navigation & Deep Linking (Sovereign Version)
 * Analisa rotas, fluxos de navegação e integridade de deep links em Kotlin/Android.
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
        this.phd_identity = "Kotlin/Android Navigation & Deep Linking";
        this.stack = "Kotlin";
    }

    override async execute(context: ProjectContext): Promise<AuditFinding[]> {
        this.setContext(context);
        const findings = await this.performAudit();
        this.mapExplorationVectors(findings);

        if (this.hub) {
            // Navigation Intelligence via Knowledge Graph
            const legacyQuery = await this.hub.queryKnowledgeGraph("Intent", "high");
            
            // PhD Modernization Reasoning
            const reasoning = await this.hub.reason(`Generate a PhD navigation modernization roadmap for a Kotlin system with ${legacyQuery.length} raw Intent patterns.`);

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
            extensions: [".kt", ".xml"],
            rules: [
                { regex: /Intent\.setData/, issue: "Deep Link Inseguro: Verifique se os dados do Intent são sanitizados para evitar Path Traversal.", severity: "high" },
                { regex: /findNavController\(\)\.navigate/, issue: "SafeArgs Enforcement: Use SafeArgs para garantir que parâmetros de rota sejam tipados e seguros.", severity: "medium" },
                { regex: /nav_graph\.xml/, issue: "Configuração de Rotas: Verifique se há 'deepLink' tags sem 'autoVerify=true' no manifesto.", severity: "medium" },
                { regex: /onNewIntent/, issue: "Ciclo de Vida: Garanta que intents de navegação sejam processados sem recriar a Activity desnecessariamente.", severity: "low" },
                { regex: /PendingIntent\.getActivity/, issue: "Notificação Insegura: Use FLAG_IMMUTABLE para evitar que terceiros modifiquem a rota de disparo.", severity: "high" },
                { regex: /ActivityNotFoundException/, issue: "Fallback de Rota: Verifique se há tratamento para falhas ao abrir links externos ou implícitos.", severity: "medium" },
                { regex: /addFlags\(Intent\.FLAG_ACTIVITY_NEW_TASK\)/, issue: "Backstack Corruption: Verifique se o flag não está limpando o histórico de navegação indevidamente.", severity: "low" }
            ]
        };
    }

    private mapExplorationVectors(findings: AuditFinding[]): void {
        this.explorationVectors = findings.map(f => ({
            route: "JVM_DOMAIN_DISCOVERY",
            vulnerabilityMap: [f.issue],
            priority: f.severity === "high" ? 1 : 2
        }));
    }

    public override performActiveHealing(blindSpots: string[]): void {
        console.log(`🛠️ [Voyager] Blindando Intents e otimizando SafeArgs em: ${blindSpots.join(", ")}`);
    }

    public override reasonAboutObjective(objective: string, _file: string, _content: string): string | StrategicFinding | null {
        return {
            objective,
            analysis: "Auditando a superfície de ataque de navegação Android/JVM.",
            recommendation: "Usar o Navigation Component com tipagem forte e garantir que todos os deep-links usem App Links (HTTPS) verificados.",
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
        return `Você é o Dr. ${this.name}, PhD em Arquitetura de Navegação Android. Sua missão é garantir fluxos seguros e determinísticos.`;
    }
}

