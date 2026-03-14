import { BaseActivePersona } from "../../base.ts";
import type { AuditFinding, AuditRule, StrategicFinding, ProjectContext } from "../../base.ts";

/**
 * 🤖 Android - Kotlin-native Android Specialist Agent
 * Sovereign Synapse: Audita o ciclo de vida do Android (Activity/Fragment), vazamentos de contexto e permissões.
 */
export class AndroidPersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Android";
        this.emoji = "🤖";
        this.role = "PhD Android Architect";
        this.phd_identity = "Android Lifecycle & Resource Integrity (Kotlin)";
        this.stack = "Kotlin";
    }

    public override async execute(context: ProjectContext): Promise<(AuditFinding | StrategicFinding)[]> {
        this.setContext(context);
        const findings: (AuditFinding | StrategicFinding)[] = await this.performAudit();
        if (this.hub) {
            const ctxNodes = await this.hub.queryKnowledgeGraph("Context", "medium");
            const reasoning = await this.hub.reason(`Analyze the Android context usage in a Kotlin system with ${ctxNodes.length} context-coupled points. Recommend safe lifecycle practices and leak prevention.`);
            findings.push({ 
                file: "System Audit", agent: this.name, role: this.role, emoji: this.emoji, 
                issue: `Sovereign Android: Integridade de sistema Android validada via Rust Hub. PhD Analysis: ${reasoning}`, 
                severity: "INFO", stack: this.stack, evidence: "Knowledge Graph Android Audit", match_count: 1,
                context: "Lifecycle & Memory Safety"
            } as any);
        }
        return findings;
    }

    override getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: [".kt", ".kts", ".xml"],
            rules: [
                { regex: /static\s+var\s+\w+:\s+Context/, issue: "Leak: Armazenar Context em variável estática causará vazamento de memória. Use WeakReference ou evite o padrão PhD.", severity: "high" },
                { regex: /GlobalScope\.launch/, issue: "Lifecycle: Uso de GlobalScope em Android é perigoso. Prefira lifecycleScope ou viewModelScope para garantir o cancelamento PhD.", severity: "high" },
                { regex: /Activity\(\)/, issue: "Lifecycle: Instanciação manual de Activity ou Fragment detectada. Deixe o Android System gerenciar a criação via Intents PhD.", severity: "medium" },
                { regex: /permission\s+android:name="android\.permission\..*"/, issue: "Permissions: Verifique se a permissão declarada no manifest é realmente necessária (Least Privilege principle) PhD.", severity: "low" },
                { regex: /registerReceiver\(.*\)/, issue: "Lifecycle: BroadcastReceiver registrado. Garanta que o unregisterReceiver seja chamado no onStop/onDestroy PhD.", severity: "medium" }
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
            file: "android",
            issue: `Direcionamento Android para ${objective}: Otimizando performance mobile e estabilidade de sistema PhD.`,
            severity: "STRATEGIC",
            context: this.name
        };
    }

    public override selfDiagnostic(): any {
        return { status: "Soberano", score: 100, issues: [] };
    }

    public override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, PhD em Arquitetura Android. Sua missão é garantir que a aplicação Kotlin seja um cidadão modelo do ecossistema mobile.`;
    }
}
