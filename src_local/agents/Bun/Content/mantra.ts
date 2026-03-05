import { BaseActivePersona } from "../../base_persona.ts";
import winston from "winston";

const logger = winston.child({ module: "Bun_Mantra" });

/**
 * 🔮 Dr. Mantra — PhD in Bun Type Safety & Runtime Type Checking
 * Especialista em type safety no runtime Bun, validação Zod e type guards.
 */
export class MantraPersona extends BaseActivePersona {
    constructor(projectRoot: string | null = null) {
        super(projectRoot);
        this.name = "Mantra";
        this.emoji = "🔮";
        this.role = "PhD Bun Type Safety Guardian";
        this.stack = "Bun";
    }

    async performAudit(): Promise<any[]> {
        this.startMetrics();
        logger.info(`[${this.name}] Analisando Pureza de Tipos Bun...`);

        const auditRules = [
            { regex: ':\\s*any\\b', issue: 'Impureza: Tipagem "any" destrói type safety no Bun.', severity: 'high' },
            { regex: 'as\\s+any\\b', issue: 'Escape: Type assertion "as any" — bypass de verificação Bun.', severity: 'high' },
            { regex: '@ts-ignore', issue: 'Supressão: @ts-ignore silencia o compilador Bun.', severity: 'critical' },
            { regex: '@ts-nocheck', issue: 'Abandono: @ts-nocheck desativa verificação do arquivo Bun inteiro.', severity: 'critical' },
            { regex: 'Bun\\.file\\([^)]+\\)\\.json\\(\\)(?!\\s*as\\b)', issue: 'Risco: Bun.file().json() sem tipagem — resultado é "any".', severity: 'high' },
        ];

        const results = this.findPatterns(['.ts', '.tsx'], auditRules as any);
        this.endMetrics(results.length);
        return results;
    }

    async reasonAboutObjective(objective: string, file: string, content: string): Promise<any | null> {
        const anyCount = this.countAnyUsages(content);
        if (anyCount <= 3) return null;

        return {
            file, severity: "HIGH", persona: this.name,
            issue: `Erosão de Tipos: O objetivo '${objective}' exige segurança Bun-nativa. O arquivo '${file}' contém ${anyCount} usos de 'any'.`
        };
    }

    private countAnyUsages(content: string): number {
        return (content.match(/:\s*any\b|as\s+any\b/g) || []).length;
    }

    getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, guardião da pureza de tipos no runtime Bun.`;
    }
}
