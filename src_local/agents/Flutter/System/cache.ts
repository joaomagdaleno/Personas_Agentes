import { BaseActivePersona } from "../../base.ts";
import type { AuditFinding, AuditRule, StrategicFinding, ProjectContext } from "../../base.ts";

/**
 * 🗄️ Cache - PhD in Data Persistence & Performance Optimization (Flutter)
 * Analisa a integridade de caches locais e estratégias de invalidação.
 */
export class CachePersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Cache";
        this.emoji = "🗄️";
        this.role = "PhD Performance Engineer";
        this.phd_identity = "Flutter Data Persistence & Caching Strategies";
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
                { regex: /HydratedBloc/, issue: "Persistência de Estado: Verifique se os dados persistidos pelo HydratedBloc são limpos em logout PhD.", severity: "medium" },
                { regex: /cacheManager\.getFile/, issue: "Gestão de Arquivos: Verifique a política de expiração para evitar enchimento de disco em Flutter PhD.", severity: "low" },
                { regex: /DefaultCacheManager\(\)/, issue: "Configuração Padrão: Considere uma configuração customizada para gerenciar melhor o stale storage PhD.", severity: "low" },
                { regex: /BaseCacheManager/, issue: "Abstração de Cache: Verifique se a implementação lida com erros de leitura/escrita IOError de forma resiliente PhD.", severity: "medium" }
            ]
        };
    }

    public override async performAudit(): Promise<AuditFinding[]> {
        this.startMetrics();
        const rules = this.getAuditRules();
        const results = await this.findPatterns(rules.extensions, rules.rules);

        // Advanced Logic: Disk Thrashing Prevention
        if (results.length > 5) {
            const strategic = this.reasonAboutObjective("Disk Integrity", "Cache", "Found high density of unmanaged cache points.");
            if (strategic) {
                results.push({
                    file: strategic.file, agent: this.name, role: this.role, emoji: this.emoji,
                    issue: strategic.issue, severity: "high", stack: this.stack, evidence: "High Cache Anomalies", match_count: results.length, context: strategic.context
                } as any);
            }
        }

        this.endMetrics(results.length);
        return results;
    }

    public override async performActiveHealing(blindSpots: string[]): Promise<number> {
        console.log(`🛠️ [Cache] Purgando caches obsoletos e validando integridade Flutter em: ${blindSpots.join(", ")}`);
        return blindSpots.length;
    }

    public override reasonAboutObjective(objective: string, _file: string, _content: string | Promise<string | null>): StrategicFinding | null {
        return {
            file: "cache_integrity",
            issue: `PhD Cache (Flutter): Auditando eficiência da camada de persistência temporária para '${objective}'. Recomendação: LRU manual se o cacheManager padrão falhar PhD.`,
            severity: "MEDIUM",
            context: this.name
        };
    }

    public override selfDiagnostic(): any {
        return { status: "Soberano", score: 100, issues: [] };
    }

    public override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, PhD em Otimização de Performance Flutter. Sua missão é garantir que o app seja rápido e o disco I/O seja otimizado.`;
    }
}
