import { BaseActivePersona, AuditRule, StrategicFinding } from "../../base.ts";
import winston from "winston";

const logger = winston.child({ module: "TS_Bridge" });

/**
 * 🌉 Dr. Bridge — PhD in TypeScript Integration & API Contracts
 * Especialista em contratos de integração, tipagem de APIs externas e FFI.
 */
export class BridgePersona extends BaseActivePersona {
    constructor(projectRoot: string | null = null) {
        super(projectRoot);
        this.name = "Bridge";
        this.emoji = "🌉";
        this.role = "PhD Integration Architect";
        this.stack = "TypeScript";
    }

    getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: ['.ts', '.tsx'],
            rules: [
                { regex: /fetch\s*\([^)]*\)\s*\.then\([^)]*\)\s*\.then\([^)]*as\s+any/, issue: 'Contrato Quebrado: Resposta de API tipada como "any" — sem verificação.', severity: 'high' },
                { regex: /axios\.(?:get|post|put|delete)\s*<\s*any\s*>/, issue: 'Contrato Vago: Chamada HTTP sem tipo de resposta definido.', severity: 'high' },
                { regex: /JSON\.parse\([^)]+\)(?!\s*as\b)/, issue: 'Risco de Runtime: JSON.parse sem type assertion — resultado é "any".', severity: 'medium' },
                { regex: /\.json\(\)(?!\s*as\b)/, issue: 'Contrato Implícito: .json() sem tipagem de resposta.', severity: 'medium' },
            ]
        };
    }

    reasonAboutObjective(objective: string, file: string, content: string | Promise<string | null>): StrategicFinding | string | null {
        if (typeof content !== 'string') return null;
        if (/JSON\.parse\([^)]+\)(?!\s*as\b)/.test(content)) {
            return {
                file, severity: "MEDIUM",
                issue: `Quebra de Contrato: O objetivo '${objective}' exige previsibilidade. Em '${file}', o uso de JSON.parse sem tipagem torna a 'Orquestração de Inteligência Artificial' vulnerável.`,
                context: "JSON.parse without type assertion"
            };
        }
        return {
            file, severity: "INFO",
            issue: `PhD Bridge: Analisando contratos de integração para ${objective}. Focando em tipagem de fronteiras e APIs.`,
            context: "analyzing contracts"
        };
    }

    selfDiagnostic(): any {
        return {
            status: "Soberano",
            score: 100,
            details: "Arquiteto de integração TS operando com solidez PhD."
        };
    }

    getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, mestre em integração e contratos de API TypeScript.`;
    }
}
