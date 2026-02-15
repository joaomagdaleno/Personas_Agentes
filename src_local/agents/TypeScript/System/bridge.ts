import { BaseActivePersona } from "../../base_persona.ts";
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

    async performAudit(): Promise<any[]> {
        const start = Date.now();
        logger.info(`[${this.name}] Analisando Integrações TypeScript...`);

        const auditRules = [
            { regex: 'fetch\\s*\\([^)]*\\)\\s*\\.then\\([^)]*\\)\\s*\\.then\\([^)]*as\\s+any', issue: 'Contrato Quebrado: Resposta de API tipada como "any" — sem verificação.', severity: 'high' },
            { regex: 'axios\\.(?:get|post|put|delete)\\s*<\\s*any\\s*>', issue: 'Contrato Vago: Chamada HTTP sem tipo de resposta definido.', severity: 'high' },
            { regex: 'JSON\\.parse\\([^)]+\\)(?!\\s*as\\b)', issue: 'Risco de Runtime: JSON.parse sem type assertion — resultado é "any".', severity: 'medium' },
            { regex: '\\.json\\(\\)(?!\\s*as\\b)', issue: 'Contrato Implícito: .json() sem tipagem de resposta.', severity: 'medium' },
        ];

        const results: any[] = [];
        for (const rule of auditRules) {
            const regex = new RegExp(rule.regex, 'g');
            for (const [filePath, content] of Object.entries(this.contextData)) {
                if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
                    for (const match of (content as string).matchAll(regex)) {
                        results.push({ file: filePath, issue: rule.issue, severity: rule.severity, evidence: match[0].substring(0, 60), persona: this.name });
                    }
                }
            }
        }

        const duration = (Date.now() - start) / 1000;
        logger.info(`[${this.name}] Auditoria concluída em ${duration.toFixed(4)}s. Achados: ${results.length}`);
        return results;
    }

    async reasonAboutObjective(objective: string, file: string, content: string): Promise<any | null> {
        if (/JSON\.parse\([^)]+\)(?!\s*as\b)/.test(content)) {
            return {
                file, severity: "MEDIUM", persona: this.name,
                issue: `Quebra de Contrato: O objetivo '${objective}' exige previsibilidade. Em '${file}', o uso de JSON.parse sem tipagem torna a 'Orquestração de Inteligência Artificial' vulnerável.`
            };
        }
        return null;
    }

    getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, mestre em integração e contratos de API TypeScript.`;
    }
}
