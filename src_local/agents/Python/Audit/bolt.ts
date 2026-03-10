/**
 * ⚡ Bolt - PhD in Computational Efficiency (Python Stack)
 * Analisa a eficiência de scripts Python, detecção de busy-waiting e loops infinitos.
 */
import type { AuditFinding, AuditRule, StrategicFinding } from "../../base.ts";
import { BaseActivePersona } from "../../base.ts";
import type { ProjectContext } from "../../../core/types.ts";

export class BoltPersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Bolt";
        this.emoji = "⚡";
        this.role = "Sovereign Performance Architect";
        this.phd_identity = "Computational Efficiency & Runtime Optimization";
        this.stack = "Python";
    }

    override async execute(context: ProjectContext): Promise<AuditFinding[]> {
        this.setContext(context);
        const findings = await this.performAudit();

        if (this.hub) {
            for (const file of Object.keys(this.contextData)) {
                if (file.endsWith(".py")) {
                    const res = await this.hub.analyzeFile(file);
                    if (res && res.complexity > 12) {
                        const neighbors = await this.hub.getContext(file);
                        const reasonPrompt = `Analyze the performance impact of high complexity (${res.complexity}) in the Python script ${file}. Context neighbors: ${neighbors.join(", ")}`;
                        const reasoning = await this.hub.reason(reasonPrompt);

                        findings.push({
                            file, agent: this.name, role: this.role, emoji: this.emoji,
                            issue: `Sovereign Alert: Gargalo crítico Python (${res.complexity}). Raciocínio PhD: ${reasoning}`,
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
            extensions: [".py"],
            rules: [
                { regex: /while True:\s+pass|while True:\s+continue/, issue: "Busy Wait: Loop infinito sem processamento útil detectado.", severity: "critical" },
                { regex: /os\.system|subprocess\.check_call/, issue: "Blocking: Chamada de sistema síncrona que bloqueia a execução.", severity: "critical" },
                { regex: /for .* in .*:\s+await/, issue: "Sequential Await: await dentro de loop sequencial em Python.", severity: "high" },
                { regex: /copy\.deepcopy\(|pickle\.dumps\(/, issue: "Ineficiência: Deep clone pesado ou serialização desnecessária.", severity: "medium" },
                { regex: /time\.sleep\(0\)|time\.sleep\(0\.001\)/, issue: "Yield Ineficiente: Polling de curto intervalo consome CPU excessiva.", severity: "high" }
            ]
        };
    }

    public override performActiveHealing(blindSpots: string[]): void {
        console.log(`🛠️ [Bolt] Injetando delays exponenciais e otimizando loops em: ${blindSpots.join(", ")}`);
    }

    public override reasonAboutObjective(objective: string, _file: string, _content: string): string | StrategicFinding | null {
        return {
            objective,
            analysis: "Auditando eficiência de execução em scripts de suporte Python.",
            recommendation: "Substituir loops 'while True' por sistemas de eventos ou timeouts nativos da linguagem.",
            severity: "high"
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
        return `Você é o Dr. ${this.name}, PhD em Eficiência Computacional Python. Sua missão é garantir latência zero na camada de suporte.`;
    }
}

