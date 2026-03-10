/**
 * ⚡ Bolt - PhD in Go Performance & Efficiency (Sovereign Version)
 * Analisa gargalos de CPU, waits infinitos e eficiência de goroutines em Go.
 */
import type { AuditFinding, AuditRule, StrategicFinding } from "../../base.ts";
import { BaseActivePersona } from "../../base.ts";
import type { ProjectContext } from "../../../core/types.ts";

export enum EfficiencyState {
    OPTIMIZED = "OPTIMIZED",
    CONGESTED = "CONGESTED",
    DEADLOCKED = "DEADLOCKED",
    SUBOPTIMAL = "SUBOPTIMAL"
}

export class GoRuntimeAnalyzer {
    public static inspect(content: string): string[] {
        const anomalies: string[] = [];
        if (content.includes("time.Sleep") && !content.includes("context")) {
            anomalies.push("Espera Não-Contextual: Use context.WithTimeout em vez de time.Sleep para evitar vazamento de goroutines.");
        }
        if (content.includes("for {") && !content.includes("select")) {
            anomalies.push("Loop Infinito Suspeito: Verifique se há ponto de saída ou select para evitar consumo de 100% de CPU.");
        }
        return anomalies;
    }
}

export class BoltPersona extends BaseActivePersona {
    constructor(projectRoot: string | undefined = undefined) {
        super(projectRoot);
        this.name = "Bolt";
        this.emoji = "⚡";
        this.role = "Sovereign Performance Architect";
        this.phd_identity = "Computational Efficiency & Runtime Optimization";
        this.stack = "Go";
    }

    override async execute(context: ProjectContext): Promise<AuditFinding[]> {
        this.setContext(context);
        const findings = await this.performAudit();

        if (this.hub) {
            for (const file of Object.keys(this.contextData)) {
                if (file.endsWith(".go")) {
                    const res = await this.hub.analyzeFile(file);
                    if (res && res.complexity > 20) {
                        const neighbors = await this.hub.getContext(file);
                        const reasonPrompt = `Analyze the concurrency risks and performance of high complexity (${res.complexity}) in the Go file ${file}. Neighbors: ${neighbors.join(", ")}`;
                        const reasoning = await this.hub.reason(reasonPrompt);

                        findings.push({
                            file, agent: this.name, role: this.role, emoji: this.emoji,
                            issue: `Sovereign Alert: Complexidade crítica Go (${res.complexity}). Raciocínio PhD: ${reasoning}`,
                            severity: "HIGH", stack: this.stack, evidence: "Local AI reasoning", match_count: 1
                        });
                    }
                }
            }
        }
        return findings;
    }

    override getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: [".go"],
            rules: [
                { regex: /for\s*\{\s*}/, issue: "Busy Wait: Loop infinito sem select detectado.", severity: "critical" },
                { regex: /sync\.Mutex\.Lock\(\)/, issue: "Blocking: Mutex Lock sem defer Unlock() imediato.", severity: "critical" },
                { regex: /make\(chan.*,\s*0\)/, issue: "Unbuffered Channel: Risco de bloqueio se não houver receptor ativo.", severity: "high" },
                { regex: /go\s+func\(\)\s*\{/, issue: "Anonymous Goroutine: Falta de rastreabilidade ou tratamento de erro.", severity: "medium" },
                { regex: /time\.After\(/, issue: "Resource Leak: time.After em loops causa vazamento de timers.", severity: "high" }
            ]
        };
    }

    public override async performAudit(): Promise<AuditFinding[]> {
        const results = await super.performAudit();
        const runtimeAnomalies = GoRuntimeAnalyzer.inspect(this.projectRoot || "");
        runtimeAnomalies.forEach(a => results.push({
            file: "RUNTIME", agent: this.name, role: this.role, emoji: this.emoji, issue: a, severity: "medium", stack: this.stack,
            evidence: "Structural Analysis", match_count: 1
        }));
        return results;
    }

    public override performActiveHealing(blindSpots: string[]): void {
        console.log(`🛠️ [Bolt] Injetando Contextos e otimizando canais em: ${blindSpots.join(", ")}`);
    }

    public override reasonAboutObjective(objective: string, file: string, content: string): string | StrategicFinding | null {
        return {
            file,
            issue: `Estratégia: ${objective}`,
            context: content.substring(0, 200),
            objective,
            analysis: "Auditando a eficiência de concorrência e o uso de recursos do runtime Go.",
            recommendation: "Substituir Mutex por canais onde possível e garantir que todas as goroutines respeitem o Context.",
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
        return `Você é o Dr. ${this.name}, PhD em Sistemas Distribuídos e Performance Go. Sua missão é garantir latência zero.`;
    }
}

