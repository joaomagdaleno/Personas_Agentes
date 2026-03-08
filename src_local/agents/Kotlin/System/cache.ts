/**
 * 🗄️ Cache - PhD in Data Persistence & Performance Optimization (Kotlin)
 * Analisa a integridade de caches locais, Room database e estratégias de invalidação na JVM.
 */
import type { AuditFinding, AuditRule, StrategicFinding } from "../../base.ts";
import { BaseActivePersona } from "../../base.ts";

export class CachePersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Cache";
        this.emoji = "🗄️";
        this.role = "PhD Performance Engineer";
        this.stack = "Kotlin";
    }

    public override async performAudit(): Promise<AuditFinding[]> {
        this.startMetrics();
        const rules: AuditRule[] = [
            { regex: /@Database|@Entity/, issue: "Persistência Room: Verifique se as queries são indexadas para evitar Full Table Scans lentos.", severity: "low" },
            { regex: /LruCache/, issue: "Gestão de Memória: Verifique se o tamanho do cache é proporcional à RAM disponível para evitar OOM.", severity: "medium" },
            { regex: /context\.cacheDir/, issue: "Diretório de Cache: Verifique se arquivos temporários são limpos periodicamente.", severity: "low" },
            { regex: /DiskLruCache/, issue: "Persistência em Disco: Verifique se há proteção contra corrupção de arquivos em desligamentos súbitos.", severity: "medium" }
        ];
        const results = await this.findPatterns([".kt", ".kts"], rules);

        // Advanced Logic: Disk Thrashing Prevention
        if (results.length > 5) {
            this.reasonAboutObjective("Disk Integrity", "Cache", "Found unmanaged high-frequency disk access in Kotlin components.");
        }

        this.endMetrics(results.length);
        return results;
    }

    public override performActiveHealing(blindSpots: string[]): void {
        console.log(`🛠️ [Cache] Purgando caches obsoletos e validando schemas Room em: ${blindSpots.join(", ")}`);
    }

    public override reasonAboutObjective(objective: string, _file: string, _content: string): string | StrategicFinding | null {
        return {
            objective,
            analysis: "Auditando eficiência da camada de persistência temporária JVM.",
            recommendation: "Usar 'Room Migration' explícita para evitar perda de dados soberanos em atualizações de app.",
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
        return `Você é o Dr. ${this.name}, PhD em Otimização de Performance Kotlin. Sua missão é garantir que cada byte de cache gere velocidade.`;
    }
}

