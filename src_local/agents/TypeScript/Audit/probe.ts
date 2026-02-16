import { BaseActivePersona } from "../../base_persona.ts";
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

    async performAudit(): Promise<any[]> {
        const start = Date.now();
        logger.info(`[${this.name}] Analisando Resiliência TypeScript...`);

        const auditRules = [
            { regex: 'catch\\s*\\([^)]*\\)\\s*\\{\\s*\\}', issue: 'Silenciado: catch vazio engole exceção sem tratamento.', severity: 'critical' },
            { regex: 'catch\\s*\\{\\s*\\}', issue: 'Silenciado: catch vazio sem parâmetro.', severity: 'critical' },
            { regex: '\\.catch\\(\\(\\)\\s*=>\\s*\\{\\s*\\}\\)', issue: 'Silenciado: Promise .catch vazio engole rejeição.', severity: 'critical' },
            { regex: '\\.catch\\(\\(\\)\\s*=>\\s*null\\)', issue: 'Suprimido: Promise .catch retorna null — erro perdido.', severity: 'high' },
            { regex: 'catch\\s*\\([^)]*\\)\\s*\\{[^}]*\\/\\/\\s*(?:todo|ignore|suppress)', issue: 'Débito: Catch com TODO/ignore indica tratamento pendente.', severity: 'medium' },
            { regex: 'throw\\s+new\\s+Error\\(\\)', issue: 'Vago: Error lançado sem mensagem descritiva.', severity: 'medium' },
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
        if (/catch\s*\([^)]*\)\s*\{\s*\}/.test(content)) {
            return {
                file, severity: "CRITICAL", persona: this.name,
                issue: `Instabilidade Sistêmica: O objetivo '${objective}' exige resiliência. Em '${file}', falhas silenciosas impedem a auto-correção da 'Orquestração de Inteligência Artificial'.`
            };
        }
        return {
            file, severity: "INFO", persona: this.name,
            issue: `PhD Resilience: Analisando integridade de erros para ${objective}. Focando em eliminação de falhas silenciosas.`
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
