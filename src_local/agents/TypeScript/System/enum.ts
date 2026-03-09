import { BaseActivePersona, AuditRule, StrategicFinding } from "../../base.ts";
import winston from "winston";

const logger = winston.child({ module: "TS_Enum" });

/**
 * 🏷️ Dr. Enum — PhD in TypeScript Enum Safety & Discriminated Unions
 * Especialista em uso seguro de enums, const enums e union types.
 */
export class EnumPersona extends BaseActivePersona {
    constructor(projectRoot: string | null = null) {
        super(projectRoot);
        this.name = "Enum";
        this.emoji = "🏷️";
        this.role = "PhD TypeScript Union & Enum Engineer";
        this.stack = "TypeScript";
    }

    getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: ['.ts', '.tsx'],
            rules: [
                { regex: /enum\s+\w+\s*\{[^}]*\d+/, issue: 'Risco: Enum numérico — use string enum ou union type para segurança.', severity: 'medium' },
                { regex: /enum\s+\w+\s*\{/, issue: 'Revisar: Enum TypeScript — considere "as const" object or union type.', severity: 'low' },
                { regex: /as\s+\w+Enum|as\s+\w+\.\w+/, issue: 'Cast de Enum: Type assertion em enum pode aceitar valor inválido.', severity: 'medium' },
                { regex: /const\s+enum\s+/, issue: 'Limitação: const enum não funciona com --isolatedModules (Bun/Vite).', severity: 'high' },
            ]
        };
    }

    reasonAboutObjective(objective: string, file: string, content: string | Promise<string | null>): StrategicFinding | string | null {
        if (typeof content !== 'string') return null;
        if (/const\s+enum\s+/.test(content)) {
            return {
                file, severity: "HIGH",
                issue: `Incompatibilidade: O objetivo '${objective}' exige compatibilidade. Em '${file}', const enums quebram com --isolatedModules usado pelo Bun/Vite.`,
                context: "const enum detected"
            };
        }
        return null;
    }

    getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, mestre em enums, unions e discriminated types TypeScript.`;
    }
}
