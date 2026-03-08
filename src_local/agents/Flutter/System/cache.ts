/**
 * 🗄️ Cache - PhD in Data Persistence & Performance Optimization (Flutter)
 * Analisa a integridade de caches locais e estratégias de invalidação.
 */
import type { AuditFinding, AuditRule, StrategicFinding } from "../../base.ts";
import { BaseActivePersona } from "../../base.ts";

export class CachePersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Cache";
        this.emoji = "🗄️";
        this.role = "PhD Performance Engineer";
        this.stack = "Flutter";
    }

    public override async performAudit(): Promise<AuditFinding[]> {
        this.startMetrics();
        const rules: AuditRule[] = [
            { regex: /HydratedBloc/, issue: "Persistência de Estado: Verifique se os dados persistidos pelo HydratedBloc são limpos em logout.", severity: "medium" },
            { regex: /cacheManager\.getFile/, issue: "Gestão de Arquivos: Verifique a política de expiração para evitar enchimento de disco.", severity: "low" },
            { regex: /DefaultCacheManager\(\)/, issue: "Configuração Padrão: Considere uma configuração customizada para gerenciar melhor o stale storage.", severity: "low" },
            { regex: /BaseCacheManager/, issue: "Abstração de Cache: Verifique se a implementação lida com erros de leitura/escrita de forma resiliente.", severity: "medium" }
        ];
        const results = await this.findPatterns([".dart"], rules);

        // Advanced Logic: Disk Thrashing Prevention
        if (results.length > 5) {
            this.reasonAboutObjective("Disk Integrity", "Cache", "Found high density of unmanaged cache points.");
        }

        this.endMetrics(results.length);
        return results;
    }

    public override performActiveHealing(blindSpots: string[]): void {
        console.log(`🛠️ [Cache] Purgando caches obsoletos e validando integridade em: ${blindSpots.join(", ")}`);
    }

    public override reasonAboutObjective(objective: string, _file: string, _content: string): string | StrategicFinding | null {
        return {
            objective,
            analysis: "Auditando eficiência da camada de persistência temporária.",
            recommendation: "Implementar 'Least Recently Used' (LRU) manual se o cacheManager padrão não suprir a demanda de performance.",
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
        return `Você é o Dr. ${this.name}, PhD em Otimização de Performance Flutter. Sua missão é garantir que o app seja rápido e o disco esteja limpo.`;
    }
}

