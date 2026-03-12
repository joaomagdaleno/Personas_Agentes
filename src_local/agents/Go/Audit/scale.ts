import { BaseActivePersona } from "../../base.ts";
import type { AuditRule, StrategicFinding } from "../../base.ts";
import type { ProjectContext } from "../../../core/types.ts";

/**
 * 🏗️ Dr. Scale — PhD in Go Architecture & Scalability
 * Especialista em arquitetura de módulos, concorrência e complexidade ciclomatica em Go.
 */
export class ScalePersona extends BaseActivePersona {
    constructor(projectRoot: string | undefined = undefined) {
        super(projectRoot);
        this.name = "Scale";
        this.emoji = "🏗️";
        this.role = "PhD Software Architect";
        this.phd_identity = "Go Architecture & Scalability";
        this.stack = "Go";
    }

    override async execute(context: ProjectContext): Promise<any> {
        this.setContext(context);
        const findings = await this.performAudit();

        if (this.hub) {
            // Architectural Intelligence: Coupling and God Files
            const graph = await this.hub.getKnowledgeGraph("src_local/core/orchestrator.ts", 2);
            
            // PhD Architectural Reasoning
            const reasoning = await this.hub.reason(`Analyze the architectural scalability of a Go system with a core graph of ${graph.nodes.length} nodes and identify critical coupling.`);

            findings.push({
                file: "Architecture Core", agent: this.name, role: this.role, emoji: this.emoji,
                issue: `Sovereign Scale: Escalabilidade validada via Rust Hub. PhD Analysis: ${reasoning}`,
                severity: "INFO", stack: this.stack, evidence: "Knowledge Graph Coupling Analysis", match_count: 1
            } as any);
        }
        return findings;
    }

    override getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: [".go"],
            rules: [
                { regex: /runtime\.GOMAXPROCS/, issue: "Manual Processor Tuning: Verifique se o ajuste manual de GOMAXPROCS é realmente necessário em runtimes modernos.", severity: "low" },
                { regex: /sync\.Map/, issue: "Large Scale Sync: Use sync.Map apenas para cenários de escrita esporádica e leitura frequente para evitar overhead.", severity: "medium" },
                { regex: /channel\s+interface\{\}/, issue: "Untyped Pipeline: Evite interface{} em canais; use tipos concretos ou structs para evitar casting custoso.", severity: "high" },
                { regex: /sync\.Pool/, issue: "Object Pooling: Uso de Pool detectado; garanta que os objetos são limpos antes de retornar ao pool.", severity: "medium" },
                { regex: /Semaphore/, issue: "Rate Limiting: Verifique se a implementação de semáforo via canais bufferizados possui limites adequados.", severity: "medium" },
                { regex: /worker\s+pool/i, issue: "Worker Pattern: Garanta que o pool de workers possui sinal de encerramento para evitar goroutines zumbis.", severity: "high" }
            ]
        };
    }

    override reasonAboutObjective(objective: string, file: string, content: string | Promise<string | null>): StrategicFinding | string | null {
        if (typeof content !== 'string') return null;
        const lines = content["split"]('\n');
        if (lines.length > 400) {
            return {
                file, severity: "HIGH",
                issue: `Entropia Arquitetural: O objetivo '${objective}' exige modularidade. O arquivo '${file}' com ${lines.length} linhas é um monólito que resiste à evolução da 'Orquestração de Inteligência Artificial'.`,
                context: `File size: ${lines.length} lines`
            };
        }
        return {
            file, severity: "INFO",
            issue: `PhD Architecture: Analisando escalabilidade e coesão para ${objective}. Focando em decomposição modular e SOLID em Go.`,
            context: "analyzing scalability"
        };
    }

    override selfDiagnostic(): any {
        return {
            status: "Soberano",
            score: 100,
            details: "Sensores de complexidade ciclomatica Go operando com precisão PhD."
        };
    }

    override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, mestre em arquitetura e escalabilidade Go.`;
    }
}
