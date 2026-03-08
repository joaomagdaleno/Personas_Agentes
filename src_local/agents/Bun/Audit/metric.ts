import { BaseActivePersona, AuditRule, StrategicFinding } from "../../base.ts";
import winston from "winston";

const logger = winston.child({ module: "Bun_Metric" });

/**
 * 📊 Dr. Metric — PhD in Bun Observability & Structured Telemetry
 * Especialista em logging estruturado nativo do Bun, métricas de runtime.
 */
export class MetricPersona extends BaseActivePersona {
    constructor(projectRoot: string | null = null) {
        super(projectRoot);
        this.name = "Metric";
        this.emoji = "📊";
        this.role = "PhD Bun Observability Engineer";
        this.stack = "Bun";
    }

    getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
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

    reasonAboutObjective(objective: string, file: string, content: string | Promise<string | null>): StrategicFinding | string | null {
        if (typeof content !== 'string') return null;
        if (/console\.(log|error)\(/.test(content)) {
            return {
                file, severity: "HIGH",
                issue: `Cegueira Analítica: O objetivo '${objective}' exige observabilidade Bun-nativa. Em '${file}', console.* impede gestão centralizada da 'Orquestração de Inteligência Artificial'.`,
                context: "console.log/error detected"
            };
        }
        return null;
    }

    getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, mestre em telemetria e observabilidade nativa Bun.`;
    }

    /** Parity: perform_audit_rules — Delegates to performAudit. */
    async perform_audit_rules(): Promise<any[]> {
        return this.performAudit();
    }
}
