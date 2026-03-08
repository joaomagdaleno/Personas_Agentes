import { BaseActivePersona, AuditRule, StrategicFinding } from "../../base.ts";
import winston from "winston";

const logger = winston.child({ module: "Bun_Probe" });

/**
 * 🔬 Dr. Probe — PhD in Bun Error Resilience & Exception Handling
 * Especialista em tratamento de erros no Bun runtime, catch de Bun.serve e promises.
 */
export class ProbePersona extends BaseActivePersona {
    constructor(projectRoot: string | null = null) {
        super(projectRoot);
        this.name = "Probe";
        this.emoji = "🔬";
        this.role = "PhD Bun Resilience Engineer";
        this.stack = "Bun";
    }

    getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: ['.ts', '.tsx'],
            rules: [
                { regex: /catch\s*\([^)]*\)\s*\{\s*\}/, issue: 'Silenciado: catch vazio engole exceção Bun.', severity: 'critical' },
                { regex: /catch\s*\{\s*\}/, issue: 'Silenciado: catch vazio sem parâmetro no Bun.', severity: 'critical' },
                { regex: /\.catch\(\(\)\s*=>\s*\{\s*\}\)/, issue: 'Silenciado: Promise .catch vazio no runtime Bun.', severity: 'critical' },
                { regex: /\.catch\(\(\)\s*=>\s*null\)/, issue: 'Suprimido: Promise .catch retorna null — erro perdido no Bun.', severity: 'high' },
                { regex: /catch\s*\([^)]*\)\s*\{[^}]*\/\/\s*(?:todo|ignore|suppress)/, issue: 'Débito: Catch com TODO/ignore indica tratamento pendente no Bun.', severity: 'medium' },
                { regex: /throw\s+new\s+Error\(\)/, issue: 'Vago: Error lançado sem mensagem descritiva no Bun.', severity: 'medium' },
            ]
        };
    }

    reasonAboutObjective(objective: string, file: string, content: string | Promise<string | null>): StrategicFinding | string | null {
        if (typeof content !== 'string') return null;
        if (/catch\s*\([^)]*\)\s*\{\s*\}/.test(content)) {
            return {
                file, severity: "CRITICAL",
                issue: `Instabilidade: O objetivo '${objective}' exige resiliência. Em '${file}', falhas silenciadas impedem a auto-correção da 'Orquestração de Inteligência Artificial' Bun.`,
                context: "empty catch block detected"
            };
        }
        return null;
    }

    getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, mestre em resiliência e tratamento de erros Bun.`;
    }
}
