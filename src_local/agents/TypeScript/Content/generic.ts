import { BaseActivePersona, AuditRule, StrategicFinding } from "../../base.ts";
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

    getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: ['.ts', '.tsx'],
            rules: [
                { regex: /<[^>]*<[^>]*<[^>]*>>/, issue: 'Complexidade: Generics com 3+ níveis de aninhamento — simplificar com type aliases.', severity: 'medium' },
                { regex: /extends\s+infer\s+\w+.*extends\s+infer/, issue: 'Magia Negra: Múltiplos "infer" condicionais — difícil de manter.', severity: 'high' },
                { regex: /type\s+\w+<[^>]*>\s*=\s*\w+<[^>]*>\s*extends\s/, issue: 'Tipo Condicional: Conditional type — verifique se não há alternativa simples.', severity: 'low' },
                { regex: /as\s+unknown\s+as\s+/, issue: 'Double Cast: "as unknown as X" — forte indicador de design errado.', severity: 'high' },
            ]
        };
    }

    reasonAboutObjective(objective: string, file: string, content: string | Promise<string | null>): StrategicFinding | string | null {
        if (typeof content !== 'string') return null;
        if (/as\s+unknown\s+as\s+/.test(content)) {
            return {
                file, severity: "HIGH",
                issue: `Magia Negra de Tipos: O objetivo '${objective}' exige clareza. Em '${file}', double casts indicam design inadequado na 'Orquestração de Inteligência Artificial'.`,
                context: "Double cast detected"
            };
        }
        return {
            file, severity: "INFO",
            issue: `PhD Generics: Analisando álgebra de tipos para ${objective}. Focando em simplificação e inferência.`,
            context: "analyzing generics"
        };
    }

    selfDiagnostic(): any {
        return {
            status: "Soberano",
            score: 100,
            details: "Analista de álgebra de tipos TS operando com precisão PhD."
        };
    }

    getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, mestre em álgebra de tipos e generics TypeScript.`;
    }
}
