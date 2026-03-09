import { BaseActivePersona, AuditRule, StrategicFinding, AuditFinding } from "../../base.ts";
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

    getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: ['.ts', '.tsx', '.toml'],
            rules: [
                { regex: /DEBUG\s*=\s*true/, issue: 'Ambiente: Flag DEBUG ativa no runtime Bun.', severity: 'high' },
                { regex: /Bun\.env\.[A-Z_]+(?!.*\?\?|.*\|\||.*throw)/, issue: 'Frágil: Bun.env sem fallback ou validação.', severity: 'medium' },
                { regex: /NODE_ENV/, issue: 'Legado: NODE_ENV em projeto Bun — considere Bun.env puro.', severity: 'low' },
            ]
        };
    }

    async performAudit(): Promise<AuditFinding[]> {
        const results = await super.performAudit();
        this.checkBunfigPresence(results);
        return results;
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

    reasonAboutObjective(objective: string, file: string, content: string | Promise<string | null>): StrategicFinding | string | null {
        if (typeof content !== 'string') return null;
        if (/DEBUG\s*=\s*true/i.test(content)) {
            return {
                file, severity: "HIGH",
                issue: `Risco: O objetivo '${objective}' exige produção limpa. Em '${file}', flags de debug expõem o runtime Bun.`,
                context: "DEBUG=true flag detected"
            };
        }
        return null;
    }

    getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, mestre em DevOps e configuração bunfig.toml.`;
    }
}
