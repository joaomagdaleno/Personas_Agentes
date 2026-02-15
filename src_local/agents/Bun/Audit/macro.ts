import { BaseActivePersona } from "../../base_persona.ts";
import winston from "winston";

const logger = winston.child({ module: "Bun_Macro" });

/**
 * ⚡ Dr. Macro — PhD in Bun Macros & Compile-Time Code Generation
 * Especialista em macros Bun, transform de build e compile-time constants.
 */
export class MacroPersona extends BaseActivePersona {
    constructor(projectRoot: string | null = null) {
        super(projectRoot);
        this.name = "Macro";
        this.emoji = "⚡";
        this.role = "PhD Bun Compile-Time Engineer";
        this.stack = "Bun";
    }

    async performAudit(): Promise<any[]> {
        const start = Date.now();
        logger.info(`[${this.name}] Analisando Macros Bun...`);

        const auditRules = [
            { regex: "with\\s*\\{\\s*type:\\s*['\"]macro['\"]", issue: 'Macro Bun: Import com { type: "macro" } — código executado em build-time.', severity: 'medium' },
            { regex: 'Bun\\.build\\([^)]*\\)(?![\\s\\S]{0,100}sourcemap)', issue: 'Build: Bun.build() sem sourcemap — dificulta debugging.', severity: 'medium' },
            { regex: 'Bun\\.Transpiler', issue: 'Transpiler: Uso de Bun.Transpiler — verifique se macros são determinísticos.', severity: 'low' },
            { regex: 'import\\.meta\\.require', issue: 'Bun-Only: import.meta.require é exclusivo Bun — não portável.', severity: 'medium' },
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
        if (/type:\s*['"]macro['"]/.test(content)) {
            return {
                file, severity: "MEDIUM", persona: this.name,
                issue: `Macro Risk: O objetivo '${objective}' exige previsibilidade. Em '${file}', macros Bun executam código em build-time — verifique determinismo.`
            };
        }
        return null;
    }

    getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, mestre em macros e compile-time code generation Bun.`;
    }
}
