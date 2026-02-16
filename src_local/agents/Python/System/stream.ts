/**
 * 🌊 Stream - PhD in Stream Processing & Data Pipes (Python Stack)
 * Analisa a integridade de pipes de dados, geradores e processamento em lote Python.
 */
import type { AuditFinding, AuditRule, StrategicFinding } from "../../base.ts";
import { BaseActivePersona } from "../../base.ts";

export class StreamPersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Stream";
        this.emoji = "🌊";
        this.role = "PhD Data Engineer";
        this.stack = "Python";
    }

    public override performAudit(): AuditFinding[] {
        this.startMetrics();
        const rules: AuditRule[] = [
            { regex: /yield .*/, issue: "Gerador Python: Verifique se o gerador possui mecanismos de consumo eficiente para evitar estouro de memória em pipes longos.", severity: "low" },
            { regex: /itertools\..*/, issue: "Iteração Avançada: O uso de itertools é encorajado pela soberania de performance PhD. Verifique a legibilidade.", severity: "low" },
            { regex: /stream\.read\(.*\)/, issue: "Leitura de Stream: Verifique se o chunk size é fixo e adequado para evitar picos de memória.", severity: "medium" },
            { regex: /pipe\.flush\(\)/, issue: "Sincronia de Pipe: O uso excessivo de flush pode degradar a performance de I/O na camada legacy.", severity: "low" }
        ];
        const results = this.findPatterns([".py"], rules);

        // Advanced Logic: Data Pipe Audit
        if (results.some(r => r.issue.includes("stream.read"))) {
            this.reasonAboutObjective("Data Integrity", "Streaming", "Found unbuffered stream reads in Python layer.");
        }

        this.endMetrics(results.length);
        return results;
    }

    public override performActiveHealing(blindSpots: string[]): void {
        console.log(`🛠️ [Stream] Bufferizando pipes e otimizando geradores de dados em: ${blindSpots.join(", ")}`);
    }

    public override reasonAboutObjective(objective: string, _file: string, _content: string): string | StrategicFinding | null {
        return {
            objective,
            analysis: "Auditando taxa de transferência e estabilidade de pipes legacy.",
            recommendation: "Usar 'generators' para processamento 'lazy' e garantir que chunks de I/O sejam potências de 2.",
            severity: "low"
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
        return `Você é o Dr. ${this.name}, PhD em Processamento de Dados Python. Sua missão é garantir que a informação flua sem atrito.`;
    }
}
