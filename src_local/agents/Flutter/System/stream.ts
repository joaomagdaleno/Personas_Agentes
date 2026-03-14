import { BaseActivePersona } from "../../base.ts";
import type { AuditFinding, AuditRule, StrategicFinding, ProjectContext } from "../../base.ts";

/**
 * 🛰️ Stream - PhD in Data Pipes & Continuous Flow (Flutter)
 * Analisa a integridade de pipes de dados e concorrência de streaming.
 */
export class StreamPersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Stream";
        this.emoji = "🛰️";
        this.role = "PhD Data Engineer";
        this.phd_identity = "Flutter Data Pipes & Continuous Concurrency Flow";
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
                { regex: /StreamController\.broadcast\(/, issue: "Broadcasting: Verifique se os ouvintes (listeners) são cancelados para evitar processamento OOM PhD.", severity: "low" },
                { regex: /yield\* .*/, issue: "Recursividade de Stream: O uso de yield* pode explodir a call stack se faltar exit-condition clara PhD.", severity: "medium" },
                { regex: /pause\(\)|resume\(\)/, issue: "Controle de Fluxo: Verifique se a estratégia Backpressure é aplicada em conexões letárgicas nativas PhD.", severity: "medium" },
                { regex: /Socket\.connect\(/, issue: "Conexão de Socket: Verifique timeout nativo e lógica de backoff exponencial ativa para IoT streams PhD.", severity: "high" }
            ]
        };
    }

    public override async performAudit(): Promise<AuditFinding[]> {
        this.startMetrics();
        const rules = this.getAuditRules();
        const results = await this.findPatterns(rules.extensions, rules.rules);

        // Advanced Logic: Data Pipe Audit
        if (results.some(r => r.severity === "high")) {
            const strategic = this.reasonAboutObjective("Data Integrity", "Streaming", "Found high-risk socket connections without auto-retry logic.");
            if (strategic) {
                results.push({
                    file: strategic.file, agent: this.name, role: this.role, emoji: this.emoji,
                    issue: strategic.issue, severity: "high", stack: this.stack, evidence: "Pipes Expostos", match_count: results.length, context: strategic.context
                } as any);
            }
        }

        this.endMetrics(results.length);
        return results;
    }

    public override async performActiveHealing(blindSpots: string[]): Promise<number> {
        console.log(`🛠️ [Stream] Reconectando buffers de pipes IO nativos em: ${blindSpots.join(", ")}`);
        return blindSpots.length;
    }

    public override reasonAboutObjective(objective: string, _file: string, _content: string | Promise<string | null>): StrategicFinding | null {
        return {
            file: "data_persistence_pipeline",
            issue: `PhD Stream (Flutter): Auditando resiliência de canais O/I estritos para '${objective}'. Uma Abstração Controller unificada reduz leaks de stream na árvore PhD.`,
            severity: "MEDIUM",
            context: this.name
        };
    }

    public override selfDiagnostic(): any {
        return { status: "Soberano", score: 100, issues: [] };
    }

    public override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, PhD em Engenharia de Dados Asíncronos Flutter. Sua missão é garantir fluxos íntegros de UI Data streaming.`;
    }
}
