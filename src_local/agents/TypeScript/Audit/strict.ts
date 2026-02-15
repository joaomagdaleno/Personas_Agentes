import { BaseActivePersona } from "../../base_persona.ts";
import winston from "winston";

const logger = winston.child({ module: "TS_Strict" });

/**
 * 🔒 Dr. Strict — PhD in TypeScript Compiler Strictness & TSConfig
 * Especialista em configuração do compilador TypeScript, strict mode e opções de segurança.
 */
export class StrictPersona extends BaseActivePersona {
    constructor(projectRoot: string | null = null) {
        super(projectRoot);
        this.name = "Strict";
        this.emoji = "🔒";
        this.role = "PhD TypeScript Compiler Guardian";
        this.stack = "TypeScript";
    }

    async performAudit(): Promise<any[]> {
        const start = Date.now();
        logger.info(`[${this.name}] Analisando Strictness do Compilador TypeScript...`);

        const results: any[] = [];

        // Analyze tsconfig.json
        for (const [filePath, content] of Object.entries(this.contextData)) {
            if (filePath.endsWith('tsconfig.json')) {
                try {
                    const config = JSON.parse(content as string);
                    const co = config.compilerOptions || {};

                    if (!co.strict) results.push({ file: filePath, issue: 'Perigoso: "strict" não está ativado no tsconfig — superfície de erros ampla.', severity: 'critical', persona: this.name });
                    if (co.noImplicitAny === false) results.push({ file: filePath, issue: 'Brecha: "noImplicitAny" desativado — variáveis sem tipo são aceitas.', severity: 'high', persona: this.name });
                    if (co.strictNullChecks === false) results.push({ file: filePath, issue: 'Brecha: "strictNullChecks" desativado — null/undefined podem causar crash.', severity: 'high', persona: this.name });
                    if (co.noUncheckedIndexedAccess !== true) results.push({ file: filePath, issue: 'Risco: "noUncheckedIndexedAccess" não ativado — acesso a array pode ser undefined.', severity: 'medium', persona: this.name });
                    if (co.exactOptionalPropertyTypes !== true) results.push({ file: filePath, issue: 'Impreciso: "exactOptionalPropertyTypes" não ativado.', severity: 'low', persona: this.name });
                    if (co.skipLibCheck === true) results.push({ file: filePath, issue: 'Atalho: "skipLibCheck" ativado — erros em dependências serão ignorados.', severity: 'medium', persona: this.name });
                } catch { /* invalid json */ }
            }
        }

        // Detect @ts-ignore in code
        for (const [filePath, content] of Object.entries(this.contextData)) {
            if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
                const suppressions = ((content as string).match(/@ts-ignore|@ts-nocheck/g) || []).length;
                if (suppressions > 0) {
                    results.push({ file: filePath, issue: `Supressão: ${suppressions}x @ts-ignore/@ts-nocheck — compilador silenciado.`, severity: 'high', persona: this.name });
                }
            }
        }

        const duration = (Date.now() - start) / 1000;
        logger.info(`[${this.name}] Auditoria concluída em ${duration.toFixed(4)}s. Achados: ${results.length}`);
        return results;
    }

    async reasonAboutObjective(objective: string, file: string, content: string): Promise<any | null> {
        if (file.endsWith('tsconfig.json') && !content.includes('"strict": true') && !content.includes('"strict":true')) {
            return {
                file, severity: "CRITICAL", persona: this.name,
                issue: `Compilador Desarmado: O objetivo '${objective}' exige segurança máxima. Em '${file}', strict mode desativado permite erros silenciosos na 'Orquestração de Inteligência Artificial'.`
            };
        }
        return null;
    }

    getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, guardião das configurações do compilador TypeScript.`;
    }
}
