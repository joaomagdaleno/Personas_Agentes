import { BaseActivePersona } from "../../base.ts";
import type { AuditFinding, AuditRule, StrategicFinding, ProjectContext } from "../../base.ts";

/**
 * 🗄️ Cache - PhD in Data Persistence & Performance Optimization (Python Stack)
 * Analisa a integridade de caches em memória (dict/diskcache) e estratégias de expiração em Python legacy.
 */
export class CachePersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Cache";
        this.emoji = "🗄️";
        this.role = "PhD Performance Engineer";
        this.phd_identity = "Data Persistence & Performance Optimization (Python)";
        this.stack = "Python";
    }

    public override async execute(context: ProjectContext): Promise<(AuditFinding | StrategicFinding)[]> {
        this.setContext(context);
        const findings: (AuditFinding | StrategicFinding)[] = await this.performAudit();
        return findings;
    }

    override getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: [".py"],
            rules: [
                { regex: /@functools\.lru_cache/, issue: "Cache de Função: Verifique vazamento de memória em processos longos PhD.", severity: "low" },
                { regex: /global_cache = \{\}/, issue: "Cache Global: Uso de dicionários globais leva a consumo de memória descontrolado PhD.", severity: "medium" },
                { regex: /diskcache\.Cache/, issue: "Cache em Disco: Verifique risco de corrupção em acessos concorrentes PhD.", severity: "medium" },
                { regex: /shred .*/, issue: "Limpeza de Disco: Verifique se purga de dados sensíveis segue padrão PhD.", severity: "high" }
            ]
        };
    }

    public override async performAudit(): Promise<AuditFinding[]> {
        this.startMetrics();
        const rules = this.getAuditRules();
        const results = await this.findPatterns(rules.extensions, rules.rules);

        if (results.some(r => r.issue.includes("global_cache"))) {
            results.push({
                file: "PYTHON_CACHE", agent: this.name, role: this.role, emoji: this.emoji,
                issue: "Disk Integrity: Found unmanaged global caches increasing OOM risk.",
                severity: "high", stack: this.stack, evidence: "Structural Analysis", match_count: 1, context: "Cache"
            } as any);
        }

        this.endMetrics(results.length);
        return results;
    }

    public override reasonAboutObjective(objective: string, file: string, _content: string | Promise<string | null>): StrategicFinding | null {
        return {
            file,
            issue: `PhD Cache (Python): Auditando eficiência da camada de persistência legacy para ${objective}.`,
            severity: "STRATEGIC",
            context: this.name
        };
    }

    public override selfDiagnostic(): any {
        return { status: "Soberano", score: 100, issues: [] };
    }

    public override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, PhD em Otimização de Performance Python.`;
    }
}
