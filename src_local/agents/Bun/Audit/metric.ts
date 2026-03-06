import { BaseActivePersona } from "../../base_persona.ts";
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

    async performAudit(): Promise<any[]> {
        const start = Date.now();
        logger.info(`[${this.name}] Analisando Observabilidade Bun...`);

        const auditRules = [
            { regex: 'console\\.log\\(', issue: 'Cegueira: console.log em produção — use logger estruturado Bun.', severity: 'high' },
            { regex: 'console\\.error\\(|console\\.warn\\(', issue: 'Telemetria Fraca: console sem contexto estruturado.', severity: 'medium' },
            { regex: 'catch\\s*\\([^)]*\\)\\s*\\{\\s*\\}', issue: 'Cegueira Total: catch vazio engole erros silenciosamente.', severity: 'critical' },
            { regex: 'process\\.hrtime', issue: 'Legado: process.hrtime — use Bun.nanoseconds() para timing nativo.', severity: 'medium' },
            { regex: 'performance\\.now\\(\\)', issue: 'Alternativa: performance.now() — considere Bun.nanoseconds().', severity: 'low' },
        ];

        const results: any[] = [];
        for (const rule of auditRules) {
            const regex = new RegExp(rule.regex, 'g');
            for (const [filePath, content] of Object.entries(this.contextData)) {
                if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
                    for (const match of (content as string).matchAll(regex)) {
                        results.push({ file: filePath, issue: rule.issue, severity: rule.severity, evidence: match[0], persona: this.name });
                    }
                }
            }
        }

        const duration = (Date.now() - start) / 1000;
        logger.info(`[${this.name}] Auditoria concluída em ${duration.toFixed(4)}s. Achados: ${results.length}`);
        return results;
    }

    async reasonAboutObjective(objective: string, file: string, content: string): Promise<any | null> {
        if (/console\.(log|error)\(/.test(content)) {
            return {
                file, severity: "HIGH", persona: this.name,
                issue: `Cegueira Analítica: O objetivo '${objective}' exige observabilidade Bun-nativa. Em '${file}', console.* impede gestão centralizada da 'Orquestração de Inteligência Artificial'.`
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
