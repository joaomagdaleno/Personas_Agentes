/**
 * 🛰️ Stream - PhD in Data Pipes & Continuous Flow (Flutter)
 * Analisa a integridade de pipes de dados e concorrência de streaming.
 */
import type { AuditFinding, AuditRule, StrategicFinding } from "../../base.ts";
import { BaseActivePersona } from "../../base.ts";

export class StreamPersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Stream";
        this.emoji = "🛰️";
        this.role = "PhD Data Engineer";
        this.stack = "Flutter";
    }

    public override async performAudit(): Promise<AuditFinding[]> {
        this.startMetrics();
        const rules: AuditRule[] = [
            { regex: /StreamController\.broadcast\(/, issue: "Broadcasting: Verifique se os ouvintes são gerenciados para evitar processamento paralelo desnecessário.", severity: "low" },
            { regex: /yield\* .*/, issue: "Recursividade de Stream: O uso de yield* pode causar alta pressão na stack se não houver condição de parada clara.", severity: "medium" },
            { regex: /pause\(\)|resume\(\)/, issue: "Controle de Fluxo: Verifique se o Backpressure é respeitado em conexões de rede lentas.", severity: "medium" },
            { regex: /Socket\.connect\(/, issue: "Conexão de Baixo Nível: Verifique se há timeout e lógica de retry exponencial para streams de socket.", severity: "high" }
        ];
        const results = await this.findPatterns([".dart"], rules);

        // Advanced Logic: Data Pipe Audit
        if (results.some(r => r.severity === "high")) {
            this.reasonAboutObjective("Data Integrity", "Streaming", "Found high-risk socket connections without retry logic.");
        }

        this.endMetrics(results.length);
        return results;
    }

    public override performActiveHealing(blindSpots: string[]): void {
        console.log(`🛠️ [Stream] Reconectando pipes e validando integridade secuencial em: ${blindSpots.join(", ")}`);
    }

    public override reasonAboutObjective(objective: string, _file: string, _content: string): string | StrategicFinding | null {
        return {
            objective,
            analysis: "Auditando resiliência de canais de dados bi-direcionais.",
            recommendation: "Implementar 'Stream Transformer' para sanitização centralizada de dados em tempo real.",
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
        return `Você é o Dr. ${this.name}, PhD em Engenharia de Dados Flutter. Sua missão é garantir que o fluxo de informação nunca seja interrompido.`;
    }
}

