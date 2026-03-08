import { BaseActivePersona, AuditRule, StrategicFinding } from "../../base.ts";
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

    getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: ['.ts', '.tsx'],
            rules: [
                { regex: /@\w+\s*\(\)\s*\n\s*@\w+\s*\(\)\s*\n\s*@\w+/, issue: 'Sobrecarga: 3+ decoradores empilhados — complexidade de metaprogramação.', severity: 'medium' },
                { regex: /experimentalDecorators/, issue: 'Experimental: Usando decoradores experimentais — migre para TC39 Stage 3.', severity: 'low' },
                { regex: /reflect-metadata/, issue: 'Dependência Pesada: reflect-metadata adiciona overhead de runtime.', severity: 'medium' },
                { regex: /@Injectable|@Component|@Module/, issue: 'Framework DI: Decoradores de injeção de dependência — verifique acoplamento.', severity: 'low' },
            ]
        };
    }

    reasonAboutObjective(objective: string, file: string, content: string | Promise<string | null>): StrategicFinding | string | null {
        if (typeof content !== 'string') return null;
        if (/reflect-metadata/.test(content)) {
            return {
                file, severity: "MEDIUM",
                issue: `Overhead de Metaprogramação: O objetivo '${objective}' exige leveza. Em '${file}', reflect-metadata adiciona custo de runtime.`,
                context: "reflect-metadata detected"
            };
        }
        return {
            file, severity: "INFO",
            issue: `PhD Decorator: Analisando metaprogramação para ${objective}. Focando em uso responsável de reflect-metadata.`,
            context: "analyzing metaprogramming"
        };
    }

    selfDiagnostic(): any {
        return {
            status: "Soberano",
            score: 100,
            details: "Especialista em metaprogramação TS operando com consciência PhD."
        };
    }

    getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, mestre em metaprogramação e decoradores TypeScript.`;
    }
}
