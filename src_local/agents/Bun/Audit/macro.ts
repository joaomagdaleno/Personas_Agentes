import { BaseActivePersona } from "../../base.ts";
import type { AuditRule, StrategicFinding } from "../../base.ts";;
import winston from "winston";

const logger = winston.child({ module: "Bun_Macro" });

/**
 * ⚡ Dr. Macro — PhD in Bun Macros & Compile-Time Code Generation
 * Especialista em macros Bun, transform de build e compile-time constants.
 */
export class MacroPersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Macro";
        this.emoji = "⚡";
        this.role = "PhD Bun Compile-Time Engineer";
        this.stack = "Bun";
    }

    getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: ['.ts', '.tsx'],
            rules: [
                { regex: /with\s*\{\s*type:\s*['"]macro['"]/, issue: 'Macro Bun: Import com { type: "macro" } — código executado em build-time.', severity: 'medium' },
                { regex: /Bun\.build\([^)]*\)(?![\s\S]{0,100}sourcemap)/, issue: 'Build: Bun.build() sem sourcemap — dificulta debugging.', severity: 'medium' },
                { regex: /Bun\.Transpiler/, issue: 'Transpiler: Uso de Bun.Transpiler — verifique se macros são determinísticos.', severity: 'low' },
                { regex: /import\.meta\.require/, issue: 'Bun-Only: import.meta.require é exclusivo Bun — não portável.', severity: 'medium' },
            ]
        };
    }

    reasonAboutObjective(objective: string, file: string, content: string | Promise<string | null>): StrategicFinding | string | null {
        if (typeof content !== 'string') return null;
        if (/type:\s*['"]macro['"]/.test(content)) {
            return {
                file, severity: "MEDIUM",
                issue: `Macro Risk: O objetivo '${objective}' exige previsibilidade. Em '${file}', macros Bun executam código em build-time — verifique determinismo.`,
                context: "Bun macro detected"
            };
        }
        return null;
    }

    getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, mestre em macros e compile-time code generation Bun.`;
    }
}
