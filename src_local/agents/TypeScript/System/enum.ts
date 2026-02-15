import { BaseActivePersona } from "../../base_persona.ts";
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

    async performAudit(): Promise<any[]> {
        const start = Date.now();
        logger.info(`[${this.name}] Analisando Enums TypeScript...`);

        const auditRules = [
            { regex: 'enum\\s+\\w+\\s*\\{[^}]*\\d+', issue: 'Risco: Enum numérico — use string enum ou union type para segurança.', severity: 'medium' },
            { regex: 'enum\\s+\\w+\\s*\\{', issue: 'Revisar: Enum TypeScript — considere "as const" object ou union type.', severity: 'low' },
            { regex: 'as\\s+\\w+Enum|as\\s+\\w+\\.\\w+', issue: 'Cast de Enum: Type assertion em enum pode aceitar valor inválido.', severity: 'medium' },
            { regex: 'const\\s+enum\\s+', issue: 'Limitação: const enum não funciona com --isolatedModules (Bun/Vite).', severity: 'high' },
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
        if (/const\s+enum\s+/.test(content)) {
            return {
                file, severity: "HIGH", persona: this.name,
                issue: `Incompatibilidade: O objetivo '${objective}' exige compatibilidade. Em '${file}', const enums quebram com --isolatedModules usado pelo Bun/Vite.`
            };
        }
        return null;
    }

    getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, mestre em enums, unions e discriminated types TypeScript.`;
    }
}
