/**
 * ⚡ Bolt - PhD in Computational Efficiency (Flutter)
 * Especialista em detecção de frames perdidos e loops bloqueantes em Dart.
 */
import { BaseActivePersona } from "../../base.ts";
import type { AuditFinding, AuditRule, StrategicFinding } from "../../base.ts";
import type { ProjectContext } from "../../../core/types.ts";

export class BoltPersona extends BaseActivePersona {
    constructor(projectRoot: string | undefined = undefined) {
        super(projectRoot);
        this.name = "Bolt";
        this.emoji = "⚡";
        this.role = "Sovereign Performance Architect";
        this.phd_identity = "Computational Efficiency & Runtime Optimization";
        this.stack = "Flutter";
    }

    override async execute(context: ProjectContext): Promise<AuditFinding[]> {
        this.setContext(context);
        const findings = await this.performAudit();

        if (this.hub) {
            for (const file of Object.keys(this.contextData)) {
                if (file.endsWith(".dart")) {
                    const res = await this.hub.analyzeFile(file);
                    if (res && res.complexity > 15) {
                        const neighbors = await this.hub.getContext(file);
                        const reasonPrompt = `Analyze the UI performance and frame-drop risks of high complexity (${res.complexity}) in the Flutter file ${file}. Neighbors: ${neighbors.join(", ")}`;
                        const reasoning = await this.hub.reason(reasonPrompt);

                        findings.push({
                            file, agent: this.name, role: this.role, emoji: this.emoji,
                            issue: `Sovereign Alert: Gargalo de UI Flutter (${res.complexity}). Raciocínio PhD: ${reasoning}`,
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
            extensions: [".dart"],
            rules: [
                { regex: /while\s*\(true\)\s*\{\s*\}/, issue: "Busy Wait: Loop infinito sem processamento assíncrono detectado.", severity: "critical" },
                { regex: /sleep\(/, issue: "Blocking: Uso de sleep() bloqueia a Main Thread do Flutter.", severity: "critical" },
                { regex: /for\s*\(.*;.*;.*\)\s*\{[^}]*await/, issue: "Sequential Await: await dentro de loop sequencial bloqueia a UI.", severity: "high" },
                { regex: /jsonDecode\(jsonEncode/, issue: "Ineficiência: Deep clone pesado via JSON roundtrip.", severity: "medium" },
                { regex: /\.forEach\(async/, issue: "Async Trap: forEach com async não aguarda execução em Dart.", severity: "high" }
            ]
        };
    }

    override reasonAboutObjective(objective: string, file: string, content: string): StrategicFinding | null {
        if (content.includes("sleep(")) {
            return {
                file,
                issue: `Degradação de UX: O objetivo '${objective}' exige fluidez. Em '${file}', o uso de sleep() trava a Main Thread, impedindo a 'Orquestração de Inteligência Artificial' de manter 60fps.`,
                severity: "STRATEGIC",
                context: this.name
            };
        }
        return null;
    }

    /**
     * 🧠 Auto-diagnóstico: Verifica a própria saúde performática.
     */
    public override selfDiagnostic() {
        const diag = super.selfDiagnostic();
        if (this.stack !== "Flutter") diag.issues.push("Inconsistent tech stack.");
        return diag;
    }

    override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, mestre em performance Flutter. Sua missão é garantir zero jank.`;
    }
}

