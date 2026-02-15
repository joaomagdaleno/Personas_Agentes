import { BaseActivePersona } from "../../base_persona.ts";
import winston from "winston";

const logger = winston.child({ module: "TS_Generic" });

/**
 * 🧬 Dr. Generic — PhD in TypeScript Generics & Type Algebra
 * Especialista em uso de generics, complexidade de tipos e type inference.
 */
export class GenericPersona extends BaseActivePersona {
    constructor(projectRoot: string | null = null) {
        super(projectRoot);
        this.name = "Generic";
        this.emoji = "🧬";
        this.role = "PhD TypeScript Type Algebraist";
        this.stack = "TypeScript";
    }

    async performAudit(): Promise<any[]> {
        const start = Date.now();
        logger.info(`[${this.name}] Analisando Complexidade de Generics TypeScript...`);

        const auditRules = [
            { regex: '<[^>]*<[^>]*<[^>]*>>', issue: 'Complexidade: Generics com 3+ níveis de aninhamento — simplificar com type aliases.', severity: 'medium' },
            { regex: 'extends\\s+infer\\s+\\w+.*extends\\s+infer', issue: 'Magia Negra: Múltiplos "infer" condicionais — difícil de manter.', severity: 'high' },
            { regex: 'type\\s+\\w+<[^>]*>\\s*=\\s*\\w+<[^>]*>\\s*extends\\s', issue: 'Tipo Condicional: Conditional type — verifique se não há alternativa simples.', severity: 'low' },
            { regex: 'as\\s+unknown\\s+as\\s+', issue: 'Double Cast: "as unknown as X" — forte indicador de design errado.', severity: 'high' },
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
        if (/as\s+unknown\s+as\s+/.test(content)) {
            return {
                file, severity: "HIGH", persona: this.name,
                issue: `Magia Negra de Tipos: O objetivo '${objective}' exige clareza. Em '${file}', double casts indicam design inadequado na 'Orquestração de Inteligência Artificial'.`
            };
        }
        return null;
    }

    getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, mestre em álgebra de tipos e generics TypeScript.`;
    }
}
