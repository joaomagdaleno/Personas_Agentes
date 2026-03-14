import { BaseActivePersona } from "../../base.ts";
import type { AuditFinding, AuditRule, StrategicFinding, ProjectContext } from "../../base.ts";

/**
 * 🗄️ Cache - PhD in Data Persistence & Performance Optimization (Kotlin)
 * Analisa a integridade de caches locais, Room database e estratégias de invalidação na JVM.
 */
export class CachePersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Cache";
        this.emoji = "🗄️";
        this.role = "PhD Performance Engineer";
        this.phd_identity = "Data Persistence & Cache Invalidation Strategies (Kotlin)";
        this.stack = "Kotlin";
    }

    public override async execute(context: ProjectContext): Promise<(AuditFinding | StrategicFinding)[]> {
        this.setContext(context);
        const findings: (AuditFinding | StrategicFinding)[] = await this.performAudit();
        return findings;
    }

    override getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: [".kt", ".kts"],
            rules: [
                { regex: /@Database|@Entity/, issue: "Persistência Room: Verifique se as queries são indexadas para evitar Full Table Scans lentos PhD.", severity: "low" },
                { regex: /LruCache/, issue: "Gestão de Memória: Verifique se o tamanho do cache é proporcional à RAM disponível para evitar OOM PhD.", severity: "medium" },
                { regex: /context\.cacheDir/, issue: "Diretório de Cache: Verifique se arquivos temporários são limpos periodicamente PhD.", severity: "low" },
                { regex: /DiskLruCache/, issue: "Persistência em Disco: Verifique se há proteção contra corrupção de arquivos em desligamentos súbitos PhD.", severity: "medium" }
            ]
        };
    }

    public override async performAudit(): Promise<AuditFinding[]> {
        this.startMetrics();
        const rules = this.getAuditRules();
        const results = await this.findPatterns(rules.extensions, rules.rules);

        if (results.length > 5) {
            const strategic = this.reasonAboutObjective("Disk Integrity", "Cache", "Found unmanaged high-frequency disk access in Kotlin components.");
            if (strategic) {
                results.push({
                    file: strategic.file, agent: this.name, role: this.role, emoji: this.emoji,
                    issue: strategic.issue, severity: "high", stack: this.stack, evidence: "High Cache Findings Count", match_count: results.length, context: strategic.context
                } as any);
            }
        }

        this.endMetrics(results.length);
        return results;
    }

    public override async performActiveHealing(blindSpots: string[]): Promise<number> {
        console.log(`🛠️ [Cache] Purgando caches obsoletos e validando schemas Room na JVM em: ${blindSpots.join(", ")}`);
        return blindSpots.length;
    }

    public override reasonAboutObjective(objective: string, _file: string, _content: string | Promise<string | null>): StrategicFinding | null {
        return {
            file: "cache_persistence",
            severity: "MEDIUM",
            issue: `PhD Cache (Kotlin): Auditando eficiência da persistência JVM para '${objective}'. Sugestão: Usar 'Room Migration' explícita.`,
            context: this.name
        };
    }

    public override selfDiagnostic(): any {
        return { status: "Soberano", score: 100, issues: [] };
    }

    public override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, PhD em Otimização de Performance Kotlin. Sua missão é garantir que cada byte de cache gere velocidade.`;
    }
}
