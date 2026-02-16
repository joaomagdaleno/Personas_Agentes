import { BaseActivePersona } from "../../base_persona.ts";
import winston from "winston";

const logger = winston.child({ module: "TS_Metric" });

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

    async performAudit(): Promise<any[]> {
        const start = Date.now();
        logger.info(`[${this.name}] Analisando Observabilidade TypeScript...`);

        const auditRules = [
            { regex: 'console\\.log\\(', issue: 'Cegueira: console.log em produção — use logger estruturado.', severity: 'high' },
            { regex: 'console\\.error\\(', issue: 'Telemetria Fraca: console.error sem contexto estruturado.', severity: 'medium' },
            { regex: 'console\\.warn\\(', issue: 'Telemetria Fraca: console.warn sem nível de severidade.', severity: 'low' },
            { regex: 'catch\\s*\\([^)]*\\)\\s*\\{\\s*\\}', issue: 'Cegueira Total: catch vazio engole erros silenciosamente.', severity: 'critical' },
            { regex: 'catch\\s*\\([^)]*\\)\\s*\\{[^}]*console\\.log', issue: 'Telemetria Informal: Erro logado via console em vez de logger.', severity: 'medium' },
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
        if (/console\.(log|error|warn)\(/.test(content)) {
            return {
                file, severity: "HIGH", persona: this.name,
                issue: `Cegueira Analítica: O objetivo '${objective}' exige observabilidade total. Em '${file}', o uso de console.* impede a gestão centralizada da 'Orquestração de Inteligência Artificial'.`
            };
        }
        return {
            file, severity: "INFO", persona: this.name,
            issue: `PhD Observability: Analisando maturidade de telemetria para ${objective}. Focando em logs estruturados e rastreabilidade soberana.`
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
