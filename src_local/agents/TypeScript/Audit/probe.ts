import { BaseActivePersona, AuditRule, StrategicFinding } from "../../base.ts";
import winston from "winston";

const logger = winston.child({ module: "TS_Probe" });

/**
 * 🔬 Dr. Probe — PhD in TypeScript Error Resilience & Exception Handling
 * Especialista em detecção de falhas silenciosas, catches vazios e error swallowing.
 */
export class ProbePersona extends BaseActivePersona {
    constructor(projectRoot: string | null = null) {
        super(projectRoot);
        this.name = "Probe";
        this.emoji = "🔬";
        this.role = "PhD Resilience Engineer";
        this.stack = "TypeScript";
    }

    getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: ['.ts', '.tsx'],
            rules: [
                { regex: /catch\s*\([^)]*\)\s*\{\s*\}/, issue: 'Silenciado: catch vazio engole exceção sem tratamento.', severity: 'critical' },
                { regex: /catch\s*\{\s*\}/, issue: 'Silenciado: catch vazio sem parâmetro.', severity: 'critical' },
                { regex: /\.catch\(\(\)\s*=>\s*\{\s*\}\)/, issue: 'Silenciado: Promise .catch vazio engole rejeição.', severity: 'critical' },
                { regex: /\.catch\(\(\)\s*=>\s*null\)/, issue: 'Suprimido: Promise .catch retorna null — erro perdido.', severity: 'high' },
                { regex: /catch\s*\([^)]*\)\s*\{[^}]*\/\/\s*(?:todo|ignore|suppress)/, issue: 'Débito: Catch com TODO/ignore indica tratamento pendente.', severity: 'medium' },
                { regex: /throw\s+new\s+Error\(\)/, issue: 'Vago: Error lançado sem mensagem descritiva.', severity: 'medium' },
            ]
        };
    }

    reasonAboutObjective(objective: string, file: string, content: string | Promise<string | null>): StrategicFinding | string | null {
        if (typeof content !== 'string') return null;
        if (/catch\s*\([^)]*\)\s*\{\s*\}/.test(content)) {
            return {
                file, severity: "CRITICAL",
                issue: `Instabilidade Sistêmica: O objetivo '${objective}' exige resiliência. Em '${file}', falhas silenciosas impedem a auto-correção da 'Orquestração de Inteligência Artificial'.`,
                context: "Empty catch detected"
            };
        }
        return {
            file, severity: "INFO",
            issue: `PhD Resilience: Analisando integridade de erros para ${objective}. Focando em eliminação de falhas silenciosas.`,
            context: "analyzing resilience"
        };
    }

    selfDiagnostic(): any {
        return {
            status: "Soberano",
            score: 100,
            details: "Diagnóstico de falhas silenciosas TS operando com rigor PhD."
        };
    }

    getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, mestre em resiliência e tolerância a falhas TypeScript.`;
    }
}
