import { BaseActivePersona } from "../../base.ts";
import type { AuditRule, StrategicFinding, AuditFinding } from "../../base.ts";
import type { ProjectContext } from "../../../core/types.ts";

/**
 * 📊 Metric Persona (Rust Stack) - PhD in Native Performance Telemetry
 * Especialista em observabilidade de memória, expvar e métricas nativas seguras.
 */
export class MetricRustAgent extends BaseActivePersona {
    constructor(projectRoot: string | undefined = undefined) {
        super(projectRoot);
        this.id = "rust:audit:metric";
        this.name = "Metric";
        this.emoji = "📊";
        this.role = "PhD Metric Architect";
        this.phd_identity = "Rust Native Performance Telemetry";
        this.stack = "Rust";
    }

    override async execute(context: ProjectContext): Promise<AuditFinding[]> {
        this.setContext(context);
        const findings = await this.performAudit();

        if (this.hub) {
            const telemetryQuery = await this.hub.queryKnowledgeGraph("Telemetry", "high");
            const reasoning = await this.hub.reason(`Analyze the observability and telemetry depth of a Rust system given ${telemetryQuery.length} metrics endpoints.`);
            
            findings.push({
                file: "Observability Core", agent: this.name, role: this.role, emoji: this.emoji,
                issue: `Sovereign Metric: Telemetria nativa Rust validada via Hub. PhD Analysis: ${reasoning}`,
                severity: "INFO", stack: this.stack, evidence: "Knowledge Graph Telemetry", match_count: 1
            } as any);
        }
        return findings;
    }

    override getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: ['.rs', 'Cargo.toml'],
            rules: [
                { regex: /println!|dbg!/, issue: 'Cegueira Nativa: Uso amador de println! detectado. Use o crate log ou tracing estruturado.', severity: 'high' },
                { regex: /unwrap\(\)|expect\(/, issue: 'Pânico em Runtime: Substitua unwrap/expect por telemetria de erro estruturado.', severity: 'medium' },
                { regex: /tracing::info!|log::info!/, issue: 'Instrumentação: Verifique se os logs estruturados não expõem dados sensíveis (PII).', severity: 'low' },
            ]
        };
    }

    override reasonAboutObjective(objective: string, file: string, _content: string | Promise<string | null>): StrategicFinding | null {
        return {
            file,
            issue: `Telemetry Strategy: ${objective}`,
            context: "Native Rust Observability",
            objective,
            analysis: "Auditando eficiência de telemetria baseada em tracing.",
            recommendation: "Garantir spans estruturados para toda chamada async complexa.",
            severity: "MEDIUM"
        };
    }

    override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, PhD em Telemetria Nativa Rust.`;
    }
}
