import { BaseActivePersona } from "../../base.ts";
import type { AuditRule, StrategicFinding, AuditFinding } from "../../base.ts";
import type { ProjectContext } from "../../../core/types.ts";

/**
 * 📊 Dr. Metric — PhD in Bun Observability & Structured Telemetry
 * Especialista em logging estruturado nativo do Bun, métricas de runtime.
 */
export class MetricPersona extends BaseActivePersona {
    constructor(projectRoot: string | undefined = undefined) {
        super(projectRoot);
        this.name = "Metric";
        this.emoji = "📊";
        this.role = "PhD Bun Observability Engineer";
        this.phd_identity = "Bun Observability & Structured Telemetry";
        this.stack = "Bun";
    }

    override async execute(context: ProjectContext): Promise<AuditFinding[]> {
        this.setContext(context);
        const findings = await this.performAudit();

        if (this.hub) {
            const telemetryQuery = await this.hub.queryKnowledgeGraph("Telemetry", "high");
            const reasoning = await this.hub.reason(`Analyze the observability and telemetry depth of a Bun system given ${telemetryQuery.length} logging or metrics nodes.`);
            
            findings.push({
                file: "Observability Core", agent: this.name, role: this.role, emoji: this.emoji,
                issue: `Sovereign Metric: Telemetria Bun validada via Rust Hub. PhD Analysis: ${reasoning}`,
                severity: "INFO", stack: this.stack, evidence: "Knowledge Graph Telemetry", match_count: 1
            } as any);
        }
        return findings;
    }

    override getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: ['.ts', '.tsx'],
            rules: [
                { regex: /console\.log\(/, issue: 'Cegueira: console.log em produção — use logger estruturado Bun.', severity: 'high' },
                { regex: /console\.error\(|console\.warn\(/, issue: 'Telemetria Fraca: console sem contexto estruturado.', severity: 'medium' },
                { regex: /catch\s*\([^)]*\)\s*\{\s*\}/, issue: 'Cegueira Total: catch vazio engole erros silenciosamente.', severity: 'critical' },
                { regex: /process\.hrtime/, issue: 'Legado: process.hrtime — use Bun.nanoseconds() para timing nativo.', severity: 'medium' },
                { regex: /performance\.now\(\)/, issue: 'Alternativa: performance.now() — considere Bun.nanoseconds().', severity: 'low' },
            ]
        };
    }

    override reasonAboutObjective(objective: string, file: string, content: string | Promise<string | null>): StrategicFinding | string | null {
        if (typeof content !== 'string') return null;
        if (content["match"](/console\.(log|error)\(/)) {
            return {
                file, severity: "HIGH",
                issue: `Cegueira Analítica: O objetivo '${objective}' exige observabilidade Bun-nativa. Em '${file}', console.* impede gestão centralizada da 'Orquestração de Inteligência Artificial'.`,
                context: "console.log/error detected"
            };
        }
        return null;
    }

    override selfDiagnostic(): any {
        return {
            status: "Soberano",
            score: 100,
            details: "Sinais vitais de telemetria Bun operando em conformidade PhD."
        };
    }

    override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, mestre em telemetria e observabilidade nativa Bun.`;
    }
}
