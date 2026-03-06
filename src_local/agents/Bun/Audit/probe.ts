import { BaseActivePersona } from "../../base_persona.ts";
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

    async performAudit(): Promise<any[]> {
        const start = Date.now();
        logger.info(`[${this.name}] Analisando Resiliência Bun...`);

        const auditRules = [
            { regex: 'catch\\s*\\([^)]*\\)\\s*\\{\\s*\\}', issue: 'Silenciado: catch vazio engole exceção Bun.', severity: 'critical' },
            { regex: 'catch\\s*\\{\\s*\\}', issue: 'Silenciado: catch vazio sem parâmetro no Bun.', severity: 'critical' },
            { regex: '\\.catch\\(\\(\\)\\s*=>\\s*\\{\\s*\\}\\)', issue: 'Silenciado: Promise .catch vazio no runtime Bun.', severity: 'critical' },
            { regex: '\\.catch\\(\\(\\)\\s*=>\\s*null\\)', issue: 'Suprimido: Promise .catch retorna null — erro perdido no Bun.', severity: 'high' },
            { regex: 'catch\\s*\\([^)]*\\)\\s*\\{[^}]*\\/\\/\\s*(?:todo|ignore|suppress)', issue: 'Débito: Catch com TODO/ignore indica tratamento pendente no Bun.', severity: 'medium' },
            { regex: 'throw\\s+new\\s+Error\\(\\)', issue: 'Vago: Error lançado sem mensagem descritiva no Bun.', severity: 'medium' },
        ];

        const results: any[] = [];
        for (const rule of auditRules) {
            const regex = new RegExp(rule.regex, 'gs');
            for (const [filePath, content] of Object.entries(this.contextData)) {
                if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
                    for (const match of (content as string).matchAll(regex)) {
                        results.push({ file: filePath, issue: rule.issue, severity: rule.severity, evidence: match[0].substring(0, 80), persona: this.name });
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
                issue: `Instabilidade: O objetivo '${objective}' exige resiliência. Em '${file}', falhas silenciadas impedem a auto-correção da 'Orquestração de Inteligência Artificial' Bun.`
            };
        }
        return null;
    }

    getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, mestre em resiliência e tratamento de erros Bun.`;
    }
}
