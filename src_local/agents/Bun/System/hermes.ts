import { BaseActivePersona } from "../../base_persona.ts";
import winston from "winston";

const logger = winston.child({ module: "Bun_Hermes" });

/**
 * ⚙️ Dr. Hermes — PhD in Bun DevOps & bunfig.toml Configuration
 * Especialista em bunfig.toml, variáveis de ambiente Bun e CI/CD.
 */
export class HermesPersona extends BaseActivePersona {
    constructor(projectRoot: string | null = null) {
        super(projectRoot);
        this.name = "Hermes";
        this.emoji = "⚙️";
        this.role = "PhD Bun DevOps Engineer";
        this.stack = "Bun";
    }

    async performAudit(): Promise<any[]> {
        const start = Date.now();
        logger.info(`[${this.name}] Analisando DevOps Bun...`);

        const auditRules = [
            { regex: 'DEBUG\\s*=\\s*true', issue: 'Ambiente: Flag DEBUG ativa no runtime Bun.', severity: 'high' },
            { regex: 'Bun\\.env\\.[A-Z_]+(?!.*\\?\\?|.*\\|\\||.*throw)', issue: 'Frágil: Bun.env sem fallback ou validação.', severity: 'medium' },
            { regex: 'NODE_ENV', issue: 'Legado: NODE_ENV em projeto Bun — considere Bun.env puro.', severity: 'low' },
        ];

        const results: any[] = [];
        for (const rule of auditRules) {
            const regex = new RegExp(rule.regex, 'g');
            for (const [filePath, content] of Object.entries(this.contextData)) {
                if (filePath.endsWith('.ts') || filePath.endsWith('.tsx') || filePath.endsWith('.toml')) {
                    for (const match of (content as string).matchAll(regex)) {
                        results.push({ file: filePath, issue: rule.issue, severity: rule.severity, evidence: match[0], persona: this.name });
                    }
                }
            }
        }

        // Check bunfig.toml existence
        const hasBunfig = Object.keys(this.contextData).some(f => f.endsWith('bunfig.toml'));
        if (!hasBunfig) {
            results.push({ file: 'ROOT', issue: 'Ausência: Projeto sem bunfig.toml — sem configuração otimizada de runtime.', severity: 'medium', persona: this.name });
        }

        const duration = (Date.now() - start) / 1000;
        logger.info(`[${this.name}] Auditoria concluída em ${duration.toFixed(4)}s. Achados: ${results.length}`);
        return results;
    }

    async reasonAboutObjective(objective: string, file: string, content: string): Promise<any | null> {
        if (/DEBUG\s*=\s*true/i.test(content)) {
            return {
                file, severity: "HIGH", persona: this.name,
                issue: `Risco: O objetivo '${objective}' exige produção limpa. Em '${file}', flags de debug expõem o runtime Bun.`
            };
        }
        return null;
    }

    getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, mestre em DevOps e configuração bunfig.toml.`;
    }
}
