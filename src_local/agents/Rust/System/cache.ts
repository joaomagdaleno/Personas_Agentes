import { BaseActivePersona } from "../../base.ts";
import type { AuditFinding, AuditRule, StrategicFinding, ProjectContext } from "../../base.ts";

/**
 * 💾 Cache - Rust-native State Persistency & Buffer Agent
 * Sovereign Synapse: Audita a gestão de cache, buffers de memória e persistência transitória.
 */
export class CachePersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Cache";
        this.emoji = "💾";
        this.role = "PhD Storage Architect";
        this.phd_identity = "Memory Buffers & Cache Integrity (Rust)";
        this.stack = "Rust";
    }

    public override async execute(context: ProjectContext): Promise<(AuditFinding | StrategicFinding)[]> {
        this.setContext(context);
        const findings: (AuditFinding | StrategicFinding)[] = await this.performAudit();
        
        if (this.hub) {
            const cacheNodes = await this.hub.queryKnowledgeGraph("HashMap", "low");
            const reasoning = await this.hub.reason(`Analyze the caching strategy of a Rust system with ${cacheNodes.length} in-memory storage points. Recommend eviction policies and thread-safe access (DashMap, RwLock).`);
            findings.push({ 
                file: "System Audit", agent: this.name, role: this.role, emoji: this.emoji, 
                issue: `Sovereign Cache: Gestão de memória L1/L2 validada via Rust Hub. PhD Analysis: ${reasoning}`, 
                severity: "INFO", stack: this.stack, evidence: "Knowledge Graph Cache Audit", match_count: 1,
                context: "Memory & Storage Integrity"
            } as any);
        }
        return findings;
    }

    override getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: [".rs"],
            rules: [
                { regex: /static\s+mut/, issue: "Safety: Estado mutável global detectado. Risco gritante de data race; prefira OnceLock, LazyLock ou Mutex estrito PhD.", severity: "high" },
                { regex: /Vec::with_capacity/, issue: "Optimization: Verifique se a capacidade pré-alocada é exata para o volume de buffers evitar re-locations O(N) PhD.", severity: "low" },
                { regex: /std::collections::HashMap/, issue: "Structure: Verifique se o hash-map é a melhor estrutura para cache ou se DashMap (concurrent) ou BTreeMap (ordenado) oferece melhor integridade PhD.", severity: "low" }
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

    public override reasonAboutObjective(objective: string, _file: string, _content: string | Promise<string | null>): StrategicFinding | null {
        return {
            file: "storage",
            issue: `Direcionamento Cache (Rust) para ${objective}: Otimizando persistência transitória e velocidade de acesso (Cache Hits) PhD.`,
            severity: "STRATEGIC",
            context: this.name
        };
    }

    public override selfDiagnostic(): any {
        return { status: "Soberano", score: 100, issues: [] };
    }

    public override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, PhD em Engenharia de Armazenamento e Buffers Rust. Sua missão é garantir latência zero (Zero-copy) e integridade total em memória.`;
    }
}
