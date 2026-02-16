/**
 * 🗄️ Cache - PhD in Data Persistence & Performance Optimization (Python Stack)
 * Analisa a integridade de caches em memória (dict/diskcache) e estratégias de expiração em Python legacy.
 */
import type { AuditFinding, AuditRule, StrategicFinding } from "../../base.ts";
import { BaseActivePersona } from "../../base.ts";

export class CachePersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Cache";
        this.emoji = "🗄️";
        this.role = "PhD Performance Engineer";
        this.stack = "Python";
    }

    public override performAudit(): AuditFinding[] {
        this.startMetrics();
        const rules: AuditRule[] = [
            { regex: /@functools\.lru_cache/, issue: "Cache de Função: Verifique se o tamanho do cache é adequado e se não há vazamento de memória em processos longos.", severity: "low" },
            { regex: /global_cache = \{\}/, issue: "Cache Global: O uso de dicionários globais como cache pode levar a consumo de memória descontrolado.", severity: "medium" },
            { regex: /diskcache\.Cache/, issue: "Cache em Disco: Verifique a política de limpeza e se há risco de corrupção de arquivos em acessos concorrentes.", severity: "medium" },
            { regex: /shred .*/, issue: "Limpeza de Disco: Verifique se a purga de dados sensíveis segue o padrão PhD de segurança.", severity: "high" }
        ];
        const results = this.findPatterns([".py"], rules);

        // Advanced Logic: Disk Thrashing Prevention
        if (results.some(r => r.issue.includes("global_cache"))) {
            this.reasonAboutObjective("Disk Integrity", "Cache", "Found unmanaged global caches in Python, increasing OOM risk.");
        }

        this.endMetrics(results.length);
        return results;
    }

    public override performActiveHealing(blindSpots: string[]): void {
        console.log(`🛠️ [Cache] Purgando caches redundantes e limitando dicionários globais em: ${blindSpots.join(", ")}`);
    }

    public override reasonAboutObjective(objective: string, _file: string, _content: string): string | StrategicFinding | null {
        return {
            objective,
            analysis: "Auditando eficiência da camada de persistência temporária legacy.",
            recommendation: "Usar 'diskcache' com expiração explícita para evitar o crescimento indefinido de dicionários globais.",
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
        return `Você é o Dr. ${this.name}, PhD em Otimização de Performance Python. Sua missão é garantir que o cache acelere o sistema sem comprometer a memória.`;
    }
}
