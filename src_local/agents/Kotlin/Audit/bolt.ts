/**
 * ⚡ Bolt - PhD in Performance & JVM Instrumentation (Kotlin)
 * Analisa a eficiência de bytecode, concorrência e uso de memória.
 */
import type { AuditFinding, AuditRule, StrategicFinding } from "../../base.ts";
import { BaseActivePersona } from "../../base.ts";
import type { ProjectContext } from "../../../core/types.ts";

export class BoltPersona extends BaseActivePersona {
    constructor(projectRoot: string | undefined = undefined) {
        super(projectRoot);
        this.name = "Bolt";
        this.emoji = "⚡";
        this.role = "Sovereign Performance Architect";
        this.phd_identity = "Computational Efficiency & Runtime Optimization";
        this.stack = "Kotlin";
    }

    override async execute(context: ProjectContext): Promise<AuditFinding[]> {
        this.setContext(context);
        const findings = await this.performAudit();

        if (this.hub) {
            for (const file of Object.keys(this.contextData)) {
                if (file.endsWith(".kt")) {
                    const res = await this.hub.analyzeFile(file);
                    if (res && res.complexity > 15) {
                        const neighbors = await this.hub.getContext(file);
                        const reasonPrompt = `Analyze the memory and performance impact of complexity (${res.complexity}) in the Kotlin file ${file}. Neighbors: ${neighbors.join(", ")}`;
                        const reasoning = await this.hub.reason(reasonPrompt);

                        findings.push({
                            file, agent: this.name, role: this.role, emoji: this.emoji,
                            issue: `Sovereign Alert: Gargalo JVM em Kotlin (${res.complexity}). Raciocínio PhD: ${reasoning}`,
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
            extensions: [".kt", ".kts"],
            rules: [
                { regex: /while\s*\(\s*true\s*\)/, issue: "Busy Wait: Loop infinito sem suspensão ou interrupção.", severity: "critical" },
                { regex: /Thread\.sleep\(/, issue: "Blocking Thread: Bloqueio de thread física em pool de coroutines.", severity: "critical" },
                { regex: /GlobalScope\.launch/, issue: "Unstructured Concurrency: Uso de GlobalScope pode causar vazamentos de memória.", severity: "high" },
                { regex: /ArrayList<.*>\(\)/, issue: "Sizing de Coleção: Alocação sem capacidade inicial definida.", severity: "low" },
                { regex: /synchronized\(.*\)/, issue: "Manual Sync: Overhead de sincronização manual; considere Mutex/Flow.", severity: "medium" }
            ]
        };
    }

    public override reasonAboutObjective(objective: string, _file: string, _content: string): string | StrategicFinding | null {
        return {
            objective,
            analysis: "Auditando eficiência de execução e gestão de recursos na JVM.",
            recommendation: "Preferir 'withContext(Dispatchers.Default)' para processamento intensivo de CPU.",
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
        return `Você é o Dr. ${this.name}, PhD em Performance JVM e Kotlin. Sua missão é garantir que o código voe com estabilidade.`;
    }
}

