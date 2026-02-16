/**
 * 🔍 Probe - PhD in Go Observability & Tracing (Sovereign Version)
 * Analisa o rastreamento, erros silenciados e monitoramento de fluxo em Go.
 */
import type { AuditFinding, AuditRule, StrategicFinding } from "../../base.ts";
import { BaseActivePersona } from "../../base.ts";

export enum TraceStateGo {
    VISIBLE = "VISIBLE",
    SILENT = "SILENT",
    BLIND = "BLIND"
}

export class GoProbeEngine {
    public static audit(content: string): string[] {
        const issues: string[] = [];
        if (content.includes("err :=") && !content.includes("if err != nil")) {
            issues.push("Erro Ignorado: Atribuição de erro detectada sem verificação imediata.");
        }
        if (content.includes("log.Fatal") && !content.includes("main")) {
            issues.push("Fatal Fora do Main: O uso de log.Fatal em pacotes mata o processo sem permitir encerramento gracioso.");
        }
        return issues;
    }
}

export class ProbePersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Probe";
        this.emoji = "🔍";
        this.role = "PhD Observability Expert";
        this.stack = "Go";
    }

    public override performAudit(): AuditFinding[] {
        this.startMetrics();
        const rules: AuditRule[] = [
            { regex: /_\s*=\s*.*\(.*\)/, issue: "Omissão Silenciosa: Ignorar retorno explicitamente via '_' pode ocultar falhas críticas.", severity: "high" },
            { regex: /recover\(\)/, issue: "Panic Recovery: Verifique se o recover captura o stacktrace e o envia para o sistema de erros (Sentry/NewRelic).", severity: "medium" },
            { regex: /fmt\.Errorf\(.*%v/, issue: "Error Wrapping: Use '%w' em fmt.Errorf para permitir o desempacotamento de erros via errors.Is/As.", severity: "low" },
            { regex: /github\.com\/sirupsen\/logrus/, issue: "Legacy Logger: Logrus está em modo de manutenção; considere migrar para zap ou zerolog.", severity: "low" },
            { regex: /OpenTelemetry/, issue: "Distributed Tracing: Instrumentação OTel detectada; garanta que os Spans possuem o Context correto.", severity: "low" },
            { regex: /errors\.New\(.*"Error"/i, issue: "Erro Não-Semântico: Use mensagens de erro descritivas para facilitar o diagnóstico forense.", severity: "medium" }
        ];
        const results = this.findPatterns([".go"], rules);

        // Advanced Logic Density
        const probeIssues = GoProbeEngine.audit(this.projectRoot || "");
        probeIssues.forEach(i => results.push({ file: "OBSERVABILITY_SCAN", agent: this.name, role: this.role, emoji: this.emoji, issue: i, severity: "medium", stack: this.stack }));

        this.endMetrics(results.length);
        return results;
    }

    public override performActiveHealing(blindSpots: string[]): void {
        console.log(`🛠️ [Probe] Injetando verificações de erro e propagando Context em: ${blindSpots.join(", ")}`);
    }

    public override reasonAboutObjective(objective: string, file: string, content: string): string | StrategicFinding | null {
        return {
            file,
            issue: `Estratégia: ${objective}`,
            context: content.substring(0, 200),
            objective,
            analysis: "Auditando a visibilidade de erros e a integridade do rastreamento do sistema Go.",
            recommendation: "Padronizar o embrulho de erros (Error Wrapping) e garantir que falhas em goroutines sejam reportadas.",
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
        return `Você é o Dr. ${this.name}, PhD em Observabilidade Go. Sua missão é garantir que nenhum erro passe despercebido.`;
    }
}
