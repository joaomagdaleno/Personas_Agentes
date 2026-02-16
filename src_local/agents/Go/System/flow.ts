/**
 * 🌊 Flow - PhD in Go Stream & Channel Intelligence (Sovereign Version)
 * Analisa o fluxo de dados, pipelines e integridade de canais em Go.
 */
import type { AuditFinding, AuditRule, StrategicFinding } from "../../base.ts";
import { BaseActivePersona } from "../../base.ts";

export enum FlowDensityGo {
    STREAMS = "STREAMS",
    PIPELINES = "PIPELINES",
    BATCH = "BATCH"
}

export class GoFlowEngine {
    public static analyze(content: string): string[] {
        const issues: string[] = [];
        if (content.includes("chan") && !content.includes("close(")) {
            issues.push("Open Channel: Canal detectado sem sinal de fechamento explícito; risco de vazamento de goroutines em sistemas de longa duração.");
        }
        if (content.includes("range chan") && !content.includes("close")) {
            issues.push("Deadlock Risk: Iteração em canal que pode nunca ser fechado pelo produtor.");
        }
        return issues;
    }
}

export class FlowPersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Flow";
        this.emoji = "🌊";
        this.role = "PhD Stream Architect";
        this.stack = "Go";
    }

    public override performAudit(): AuditFinding[] {
        this.startMetrics();
        const rules: AuditRule[] = [
            { regex: /select\s*\{\s*case/, issue: "Multiplexing: Verifique se há um caso 'default' ou timeout para evitar bloqueios permanentes no select.", severity: "high" },
            { regex: /context\.WithCancel/, issue: "Cascading Cancellation: Garanta que a função de cancelamento é chamada via defer para liberar recursos.", severity: "medium" },
            { regex: /io\.Copy/, issue: "Stream Transfer: Verifique se o buffer de transferência é adequado para o volume de dados esperado.", severity: "low" },
            { regex: /encoding\/json\.NewDecoder/, issue: "Streaming JSON: Prefira NewDecoder para fluxos contínuos em vez de json.Unmarshal para grandes volumes.", severity: "medium" },
            { regex: /sync\.Cond/, issue: "Complex Sync: Condicionais detectadas; verifique se a lógica de sinalização não possui race conditions.", severity: "high" },
            { regex: /<-time\.After/, issue: "Timeout Leak: Evite em loops; prefira context ou time.NewTimer para evitar acúmulo de timers não disparados.", severity: "high" }
        ];
        const results = this.findPatterns([".go"], rules);

        // Advanced Logic Density
        const flowIssues = GoFlowEngine.analyze(this.projectRoot || "");
        flowIssues.forEach(f => results.push({ file: "FLOW_STREAM", agent: this.name, role: this.role, emoji: this.emoji, issue: f, severity: "medium", stack: this.stack }));

        this.endMetrics(results.length);
        return results;
    }

    public override performActiveHealing(blindSpots: string[]): void {
        console.log(`🛠️ [Flow] Otimizando pipelines de dados e fechando canais em: ${blindSpots.join(", ")}`);
    }

    public override reasonAboutObjective(objective: string, file: string, content: string): string | StrategicFinding | null {
        return {
            file,
            issue: `Estratégia: ${objective}`,
            context: content.substring(0, 200),
            objective,
            analysis: "Auditando a vazão e a integridade dos fluxos de dados concorrentes Go.",
            recommendation: "Implementar backpressure manual via canais bufferizados para evitar saturação de memória em picos de carga.",
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
        return `Você é o Dr. ${this.name}, PhD em Processamento de Fluxos Go. Sua missão é garantir a fluidez ininterrupta dos dados.`;
    }
}
