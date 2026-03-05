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

        const auditRules = this.getDevOpsRules();
        const results: any[] = [];

        for (const rule of auditRules) {
            this.auditWithRule(rule, results);
        }

        this.checkBunfigPresence(results);

        const duration = (Date.now() - start) / 1000;
        logger.info(`[${this.name}] Auditoria concluída em ${duration.toFixed(4)}s. Achados: ${results.length}`);
        return results;
    }

    private getDevOpsRules() {
        return [
            { regex: 'DEBUG\\s*=\\s*true', issue: 'Ambiente: Flag DEBUG ativa no runtime Bun.', severity: 'high' },
            { regex: 'Bun\\.env\\.[A-Z_]+(?!.*\\?\\?|.*\\|\\||.*throw)', issue: 'Frágil: Bun.env sem fallback ou validação.', severity: 'medium' },
            { regex: 'NODE_ENV', issue: 'Legado: NODE_ENV em projeto Bun — considere Bun.env puro.', severity: 'low' },
        ];
    }

    private auditWithRule(rule: any, results: any[]) {
        const regex = new RegExp(rule.regex, 'g');
        for (const [filePath, content] of Object.entries(this.contextData)) {
            if (this.shouldAuditFile(filePath)) {
                this.scanContent(filePath, content as string, regex, rule, results);
            }
        }
    }

    private shouldAuditFile(filePath: string): boolean {
        return filePath.endsWith('.ts') || filePath.endsWith('.tsx') || filePath.endsWith('.toml');
    }

    private scanContent(filePath: string, content: string, regex: RegExp, rule: any, results: any[]) {
        for (const match of content.matchAll(regex)) {
            results.push({
                file: filePath,
                issue: rule.issue,
                severity: rule.severity,
                evidence: match[0],
                persona: this.name
            });
        }
    }

    private checkBunfigPresence(results: any[]) {
        const hasBunfig = Object.keys(this.contextData).some(f => f.endsWith('bunfig.toml'));
        if (!hasBunfig) {
            results.push({
                file: 'ROOT',
                issue: 'Ausência: Projeto sem bunfig.toml — sem configuração otimizada de runtime.',
                severity: 'medium',
                persona: this.name
            });
        }
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
