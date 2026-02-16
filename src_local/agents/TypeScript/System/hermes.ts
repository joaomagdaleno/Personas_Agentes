import { BaseActivePersona } from "../../base_persona.ts";
import winston from "winston";

const logger = winston.child({ module: "TS_Hermes" });

/**
 * ⚙️ Dr. Hermes — PhD in TypeScript DevOps, CI/CD & Environment Safety
 * Especialista em segurança de ambiente, flags de debug e configuração de produção.
 */
export class HermesPersona extends BaseActivePersona {
    constructor(projectRoot: string | null = null) {
        super(projectRoot);
        this.name = "Hermes";
        this.emoji = "⚙️";
        this.role = "PhD DevOps & SRE Engineer";
        this.stack = "TypeScript";
    }

    async performAudit(): Promise<any[]> {
        const start = Date.now();
        logger.info(`[${this.name}] Analisando DevOps TypeScript...`);

        const auditRules = [
            { regex: 'DEBUG\\s*=\\s*true', issue: 'Ambiente: Flag DEBUG ativa — risco em produção.', severity: 'high' },
            { regex: 'NODE_ENV\\s*[!=]==?\\s*["\']development', issue: 'Condicional de Ambiente: Lógica bifurcada por NODE_ENV — verifique segurança.', severity: 'medium' },
            { regex: 'process\\.env\\.[A-Z_]+(?!\\s*\\?)(?!.*\\|\\|)(?!.*\\?\\?)(?!.*throw)', issue: 'Variável Frágil: process.env sem fallback ou validação.', severity: 'medium' },
            { regex: 'dotenv\\.config\\(\\)', issue: 'Risco: dotenv carregando .env — garanta que .env não está no Git.', severity: 'low' },
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
        if (/DEBUG\s*=\s*true/i.test(content)) {
            return {
                file, severity: "HIGH", persona: this.name,
                issue: `Risco de Integridade: O objetivo '${objective}' exige artefatos verificados. Em '${file}', flags de debug em produção expõem a 'Orquestração de Inteligência Artificial'.`
            };
        }
        return {
            file, severity: "INFO", persona: this.name,
            issue: `PhD Hermes: Analisando estabilidade de ambiente para ${objective}. Focando em configuração segura e reprodutibilidade.`
        };
    }

    selfDiagnostic(): any {
        return {
            status: "Soberano",
            score: 100,
            details: "Engenheiro SRE TS operando com confiabilidade PhD."
        };
    }

    getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, mestre em DevOps e SRE TypeScript.`;
    }
}
