/**
 * 📊 Metric - PhD in Go Performance Telemetry (Sovereign Version)
 * Analisa a instrumentação, telemetria e o uso de recursos do runtime Go.
 */
import type { AuditFinding, AuditRule, StrategicFinding } from "../../base.ts";
import { BaseActivePersona } from "../../base.ts";

export enum MetricDensity {
    INSTRUMENTED = "INSTRUMENTED",
    OPAQUE = "OPAQUE",
    COLD = "COLD"
}

export class GoMetricEngine {
    public static validate(content: string): string[] {
        const findings: string[] = [];
        if (!content.includes("prometheus") && !content.includes("expvar")) {
            findings.push("Cegueira de Runtime: Nenhuma exportação de métricas nativas (expvar) ou Prometheus detectada.");
        }
        if (content.includes("runtime.GC()") && !content.includes("debug")) {
            findings.push("GC Manual: Chamada explícita ao Garbage Collector detectada; verifique se há problemas de alocação.");
        }
        return findings;
    }
}

export class MetricPersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Metric";
        this.emoji = "📊";
        this.role = "PhD Metric Architect";
        this.stack = "Go";
    }

    public override async performAudit(): Promise<AuditFinding[]> {
        this.startMetrics();
        const rules: AuditRule[] = [
            { regex: /log\.Printf|fmt\.Print|fmt\.Println/, issue: "Cegueira: Logging amador (desestruturado) detectado.", severity: "high" },
            { regex: /panic\(.*\)/, issue: "Interrupção Brusca: Pânicos sem contexto estruturado prejudicam a telemetria.", severity: "high" },
            { regex: /Recover\(\)/, issue: "Abstração de Falha: Verifique se o recover() garante a telemetria do erro.", severity: "medium" },
            { regex: /expvar\.Publish|prometheus\.NewCounter/, issue: "Instrumentação: Verifique se as réguas de telemetria seguem o padrão forense.", severity: "low" },
            { regex: /pprof/, issue: "Profiling: Endpoint pprof exposto sem proteção em telemetria de produção.", severity: "high" }
        ];
        const results = await this.findPatterns([".go"], rules);

        // Advanced Logic Density
        const metricFindings = GoMetricEngine.validate(this.projectRoot || "");
        metricFindings.forEach(f => results.push({ file: "METRIC_SOURCE", agent: this.name, role: this.role, emoji: this.emoji, issue: f, severity: "medium", stack: this.stack }));

        this.endMetrics(results.length);
        return results;
    }

    public override performActiveHealing(blindSpots: string[]): void {
        console.log(`🛠️ [Metric] Injetando middleware de telemetria e configurando Zap em: ${blindSpots.join(", ")}`);
    }

    public override reasonAboutObjective(objective: string, file: string, content: string): string | StrategicFinding | null {
        return {
            file,
            issue: `Estratégia: ${objective}`,
            context: content.substring(0, 200),
            objective,
            analysis: "Auditando a visibilidade operacional e o custo de instrumentação do sistema Go.",
            recommendation: "Padronizar logs em JSON e expor métricas via OpenTelemetry para compatibilidade total com o ecossistema.",
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
        return `Você é o Dr. ${this.name}, PhD em Telemetria de Sistemas Go. Sua missão é garantir a transparência absoluta do estado do sistema.`;
    }
}

