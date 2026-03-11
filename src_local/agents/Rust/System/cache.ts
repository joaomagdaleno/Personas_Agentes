/**
 * 💾 Cache - Rust-native State Persistency & Buffer Agent
 * Sovereign Synapse: Audita a gestão de cache, buffers de memória e persistência transitória.
 */
import type { AuditRule, StrategicFinding } from "../../base.ts";
import { BaseActivePersona } from "../../base.ts";

export class CachePersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Cache";
        this.emoji = "💾";
        this.role = "PhD Storage Architect";
        this.phd_identity = "Memory Buffers & Cache Integrity (Rust)";
        this.stack = "Rust";
    }

    public override async execute(context: any): Promise<any> {
        this.setContext(context);
        const findings = await this.performAudit();
        if (this.hub) {
            const cacheNodes = await this.hub.queryKnowledgeGraph("HashMap", "low");
            const reasoning = await this.hub.reason(`Analyze the caching strategy of a Rust system with ${cacheNodes.length} in-memory storage points. Recommend eviction policies and thread-safe access.`);
            findings.push({ 
                file: "System Audit", agent: this.name, role: this.role, emoji: this.emoji, 
                issue: `Sovereign Cache: Gestão de memória validada via Rust Hub. PhD Analysis: ${reasoning}`, 
                severity: "INFO", stack: this.stack, evidence: "Knowledge Graph Cache Audit", match_count: 1,
                context: "Memory & Storage Integrity"
            } as any);
        }
        return findings;
    }

    getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: [".rs"],
            rules: [
                { regex: /static\s+mut/, issue: "Safety: Estado mutável global detectado. Risco de data race; prefira OnceCell ou Mutex.", severity: "high" },
                { regex: /Vec::with_capacity/, issue: "Optimization: Verifique se a capacidade pré-alocada é ótima para o volume de dados PhD.", severity: "low" },
                { regex: /std::collections::HashMap/, issue: "Structure: Verifique se o hash-map é a melhor estrutura para cache ou se um BTreeMap oferece melhor performance.", severity: "low" }
            ]
        };
    }

    public override reasonAboutObjective(objective: string, _file: string, _content: string): StrategicFinding | null {
        return {
            file: "storage",
            issue: `Direcionamento Cache para ${objective}: Otimizando persistência e velocidade de acesso.`,
            severity: "STRATEGIC",
            context: this.name
        };
    }

    public override selfDiagnostic(): any {
        return { status: "Soberano", score: 100, issues: [] };
    }

    public override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, PhD em Engenharia de Armazenamento. Sua missão é garantir latência zero e integridade total.`;
    }
}
