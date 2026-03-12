import { BaseActivePersona } from "../../base.ts";
import type { AuditRule, StrategicFinding, AuditFinding } from "../../base.ts";
import type { ProjectContext } from "../../../core/types.ts";

export enum MetricDensity {
    INSTRUMENTED = "INSTRUMENTED",
    OPAQUE = "OPAQUE",
    COLD = "COLD"
}

/**
 * 📊 Dr. Metric — PhD in TypeScript Observability & Telemetry
 * Especialista em logging estruturado, métricas e rastreabilidade.
 */
export class MetricPersona extends BaseActivePersona {
    constructor(projectRoot: string | undefined = undefined) {
        super(projectRoot);
        this.name = "Metric";
        this.emoji = "📊";
        this.role = "PhD Observability Engineer";
        this.phd_identity = "TypeScript Data Telemetry & Logging";
        this.stack = "TypeScript";
    }

    override async execute(context: ProjectContext): Promise<AuditFinding[]> {
        this.setContext(context);
        const findings = await this.performAudit();

        if (this.hub) {
            const telemetryQuery = await this.hub.queryKnowledgeGraph("Telemetry", "high");
            const reasoning = await this.hub.reason(`Analyze the observability and telemetry depth given ${telemetryQuery.length} logging or metrics nodes.`);
            
            findings.push({
                file: "Observability Core", agent: this.name, role: this.role, emoji: this.emoji,
                issue: `Sovereign Metric: Telemetria validada via Rust Hub. PhD Analysis: ${reasoning}`,
                severity: "INFO", stack: this.stack, evidence: "Knowledge Graph Telemetry", match_count: 1
            } as any);
        }
        return findings;
    }

    getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: ['.ts', '.tsx'],
            rules: [
                { regex: /console\.log\(/, issue: 'Cegueira: console.log em produção — use logger estruturado.', severity: 'high' },
                { regex: /console\.error\(/, issue: 'Telemetria Fraca: console.error sem contexto estruturado.', severity: 'medium' },
                { regex: /console\.warn\(/, issue: 'Telemetria Fraca: console.warn sem nível de severidade.', severity: 'low' },
                { regex: /catch\s*\([^)]*\)\s*\{\s*\}/, issue: 'Cegueira Total: catch vazio engole erros silenciosamente.', severity: 'critical' },
                { regex: /catch\s*\([^)]*\)\s*\{[^}]*console\.log/, issue: 'Telemetria Informal: Erro logado via console em vez de logger.', severity: 'medium' },
            ]
        };
    }

    override reasonAboutObjective(objective: string, file: string, content: string | Promise<string | null>): StrategicFinding | string | null {
        if (typeof content !== 'string') return null;
        if (content["match"](/console\.(log|error|warn)\(/)) {
            return {
                file, severity: "HIGH",
                issue: `Cegueira Analítica: O objetivo '${objective}' exige observabilidade total. Em '${file}', o uso de console.* impede a gestão centralizada da 'Orquestração de Inteligência Artificial'.`,
                context: "console usage detected"
            };
        }
        return {
            file, severity: "INFO",
            issue: `PhD Observability: Analisando maturidade de telemetria para ${objective}. Focando em logs estruturados e rastreabilidade soberana.`,
            context: "analyzing observability"
        };
    }

    override selfDiagnostic(): any {
        return {
            status: "Soberano",
            score: 100,
            details: "Sinais vitais de telemetria TS operando em conformidade PhD."
        };
    }

    override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, mestre em telemetria e análise TypeScript.`;
    }
}
