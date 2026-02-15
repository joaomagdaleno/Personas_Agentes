import { BaseActivePersona } from "../../base_persona.ts";
import winston from "winston";

const logger = winston.child({ module: "TS_Decorator" });

/**
 * 🎀 Dr. Decorator — PhD in TypeScript Decorators & Metadata Reflection
 * Especialista em padrões de decoradores, reflect-metadata e dependency injection.
 */
export class DecoratorPersona extends BaseActivePersona {
    constructor(projectRoot: string | null = null) {
        super(projectRoot);
        this.name = "Decorator";
        this.emoji = "🎀";
        this.role = "PhD TypeScript Metaprogramming Engineer";
        this.stack = "TypeScript";
    }

    async performAudit(): Promise<any[]> {
        const start = Date.now();
        logger.info(`[${this.name}] Analisando Decoradores TypeScript...`);

        const auditRules = [
            { regex: '@\\w+\\s*\\(\\)\\s*\\n\\s*@\\w+\\s*\\(\\)\\s*\\n\\s*@\\w+', issue: 'Sobrecarga: 3+ decoradores empilhados — complexidade de metaprogramação.', severity: 'medium' },
            { regex: 'experimentalDecorators', issue: 'Experimental: Usando decoradores experimentais — migre para TC39 Stage 3.', severity: 'low' },
            { regex: 'reflect-metadata', issue: 'Dependência Pesada: reflect-metadata adiciona overhead de runtime.', severity: 'medium' },
            { regex: '@Injectable|@Component|@Module', issue: 'Framework DI: Decoradores de injeção de dependência — verifique acoplamento.', severity: 'low' },
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
        if (/reflect-metadata/.test(content)) {
            return {
                file, severity: "MEDIUM", persona: this.name,
                issue: `Overhead de Metaprogramação: O objetivo '${objective}' exige leveza. Em '${file}', reflect-metadata adiciona custo de runtime.`
            };
        }
        return null;
    }

    getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, mestre em metaprogramação e decoradores TypeScript.`;
    }
}
