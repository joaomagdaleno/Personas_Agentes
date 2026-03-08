import { BaseActivePersona, AuditRule, StrategicFinding } from "../../base.ts";
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

    getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: ['.ts', '.tsx'],
            rules: [
                { regex: /\/\/\s*TODO[:\s]/i, issue: 'Dívida Técnica: TODO pendente — tarefa incompleta no código.', severity: 'medium' },
                { regex: /\/\/\s*FIXME[:\s]/i, issue: 'Dívida Crítica: FIXME — bug conhecido e aceito sem correção.', severity: 'high' },
                { regex: /\/\/\s*HACK[:\s]/i, issue: 'Gambiarra: HACK — solução temporária perigosa.', severity: 'high' },
                { regex: /\/\/\s*XXX[:\s]/i, issue: 'Alerta: XXX — área de código perigosa marcada para revisão.', severity: 'medium' },
                { regex: /throw\s+new\s+Error\(["']not\s+implemented/i, issue: 'Incompleto: Funcionalidade declarada mas não implementada.', severity: 'high' },
                { regex: /as\s+any\s*\/\/.*later|as\s+any\s*\/\/.*temporary/i, issue: 'Supressão Temporária: type assertion "any" com promessa de resolver depois.', severity: 'medium' },
            ]
        };
    }

    reasonAboutObjective(objective: string, file: string, content: string | Promise<string | null>): StrategicFinding | string | null {
        if (typeof content !== 'string') return null;
        const todoCount = (content.match(/\/\/\s*(TODO|FIXME|HACK|XXX)/gi) || []).length;
        if (todoCount > 3) {
            return {
                file, severity: "HIGH",
                issue: `Erosão de Escopo: O objetivo '${objective}' exige entrega completa. O arquivo '${file}' contém ${todoCount} marcadores de dívida técnica na 'Orquestração de Inteligência Artificial'.`,
                context: `Debt markers: ${todoCount}`
            };
        }
        return {
            file, severity: "INFO",
            issue: `PhD Scope: Analisando integridade do backlog para ${objective}. Focando em priorização e eliminação de dívida técnica.`,
            context: `Debt markers: ${todoCount}`
        };
    }

    selfDiagnostic(): any {
        return {
            status: "Soberano",
            score: 100,
            details: "Rastreador de dívida técnica TS operando com visão PhD."
        };
    }

    getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, mestre em gestão de escopo e dívida técnica TypeScript.`;
    }
}
