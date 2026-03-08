import { BaseActivePersona, AuditRule, StrategicFinding } from "../../base.ts";
import winston from "winston";

const logger = winston.child({ module: "TS_Metric" });

export enum MetricDensity {
    INSTRUMENTED = "INSTRUMENTED",
    OPAQUE = "OPAQUE",
    COLD = "COLD"
}

export class TSMetricEngine {
    public static validate(content: string): string[] {
        const findings: string[] = [];
        if (!content.includes("winston") && !content.includes("telemetry")) {
            findings.push("Cegueira de Runtime: Nenhuma exportação de métricas nativas ou Telemetria detectada.");
        }
        return findings;
    }
}

/**
 * 📊 Dr. Metric — PhD in TypeScript Observability & Telemetry
 * Especialista em logging estruturado, métricas e rastreabilidade.
 */
export class MetricPersona extends BaseActivePersona {
    constructor(projectRoot: string | null = null) {
        super(projectRoot);
        this.name = "Metric";
        this.emoji = "📊";
        this.role = "PhD Observability Engineer";
        this.stack = "TypeScript";
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

    reasonAboutObjective(objective: string, file: string, content: string | Promise<string | null>): StrategicFinding | string | null {
        if (typeof content !== 'string') return null;
        if (/console\.(log|error|warn)\(/.test(content)) {
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

    selfDiagnostic(): any {
        return {
            status: "Soberano",
            score: 100,
            details: "Sinais vitais de telemetria TS operando em conformidade PhD."
        };
    }

    getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, mestre em telemetria e análise TypeScript.`;
    }
}
