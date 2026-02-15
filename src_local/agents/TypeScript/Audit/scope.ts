import { BaseActivePersona } from "../../base_persona.ts";
import winston from "winston";

const logger = winston.child({ module: "TS_Scope" });

/**
 * 🎯 Dr. Scope — PhD in TypeScript Project Management & Technical Debt
 * Especialista em detecção de dívida técnica, TODOs pendentes e implementações incompletas.
 */
export class ScopePersona extends BaseActivePersona {
    constructor(projectRoot: string | null = null) {
        super(projectRoot);
        this.name = "Scope";
        this.emoji = "🎯";
        this.role = "PhD Project Strategist";
        this.stack = "TypeScript";
    }

    async performAudit(): Promise<any[]> {
        const start = Date.now();
        logger.info(`[${this.name}] Analisando Gestão de Escopo TypeScript...`);

        const auditRules = [
            { regex: '\\/\\/\\s*TODO[:\\s]', issue: 'Dívida Técnica: TODO pendente — tarefa incompleta no código.', severity: 'medium' },
            { regex: '\\/\\/\\s*FIXME[:\\s]', issue: 'Dívida Crítica: FIXME — bug conhecido e aceito sem correção.', severity: 'high' },
            { regex: '\\/\\/\\s*HACK[:\\s]', issue: 'Gambiarra: HACK — solução temporária perigosa.', severity: 'high' },
            { regex: '\\/\\/\\s*XXX[:\\s]', issue: 'Alerta: XXX — área de código perigosa marcada para revisão.', severity: 'medium' },
            { regex: 'throw\\s+new\\s+Error\\(["\']not\\s+implemented', issue: 'Incompleto: Funcionalidade declarada mas não implementada.', severity: 'high' },
            { regex: 'as\\s+any\\s*\\/\\/.*later|as\\s+any\\s*\\/\\/.*temporary', issue: 'Supressão Temporária: type assertion "any" com promessa de resolver depois.', severity: 'medium' },
        ];

        const results: any[] = [];
        for (const rule of auditRules) {
            const regex = new RegExp(rule.regex, 'gi');
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
        const todoCount = (content.match(/\/\/\s*(TODO|FIXME|HACK|XXX)/gi) || []).length;
        if (todoCount > 3) {
            return {
                file, severity: "HIGH", persona: this.name,
                issue: `Erosão de Escopo: O objetivo '${objective}' exige entrega completa. O arquivo '${file}' contém ${todoCount} marcadores de dívida técnica na 'Orquestração de Inteligência Artificial'.`
            };
        }
        return null;
    }

    getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, mestre em gestão de escopo e dívida técnica TypeScript.`;
    }
}
