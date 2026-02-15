import { BaseActivePersona } from "../../base_persona.ts";
import winston from "winston";

const logger = winston.child({ module: "TS_Voyager" });

/**
 * 🧭 Dr. Voyager — PhD in TypeScript Modernization & Innovation
 * Especialista em detecção de padrões legados, var, require() e CommonJS.
 */
export class VoyagerPersona extends BaseActivePersona {
    constructor(projectRoot: string | null = null) {
        super(projectRoot);
        this.name = "Voyager";
        this.emoji = "🧭";
        this.role = "PhD Innovation & Modernization Engineer";
        this.stack = "TypeScript";
    }

    async performAudit(): Promise<any[]> {
        const start = Date.now();
        logger.info(`[${this.name}] Analisando Modernidade TypeScript...`);

        const auditRules = [
            { regex: '\\bvar\\s+\\w+', issue: 'Legado: "var" — use "const" ou "let" para escopo seguro.', severity: 'high' },
            { regex: '\\brequire\\s*\\(', issue: 'CommonJS: require() — use ESM "import" para compatibilidade TypeScript.', severity: 'high' },
            { regex: 'module\\.exports', issue: 'CommonJS: module.exports — use "export" ESM.', severity: 'high' },
            { regex: 'arguments\\b', issue: 'Legado: "arguments" — use rest parameters (...args).', severity: 'medium' },
            { regex: '\\.apply\\(|\\bcall\\(', issue: 'Legado: .apply()/.call() — use spread operator ou arrow functions.', severity: 'low' },
            { regex: 'new\\s+Promise\\(.*resolve.*reject', issue: 'Verboso: Promise constructor manual — prefira async/await.', severity: 'low' },
        ];

        const results: any[] = [];
        for (const rule of auditRules) {
            const regex = new RegExp(rule.regex, 'g');
            for (const [filePath, content] of Object.entries(this.contextData)) {
                if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
                    for (const match of (content as string).matchAll(regex)) {
                        results.push({ file: filePath, issue: rule.issue, severity: rule.severity, evidence: match[0], persona: this.name });
                    }
                }
            }
        }

        const duration = (Date.now() - start) / 1000;
        logger.info(`[${this.name}] Auditoria concluída em ${duration.toFixed(4)}s. Achados: ${results.length}`);
        return results;
    }

    async reasonAboutObjective(objective: string, file: string, content: string): Promise<any | null> {
        if (/\bvar\s+\w+|\brequire\s*\(/.test(content)) {
            return {
                file, severity: "HIGH", persona: this.name,
                issue: `Débito Tecnológico: O objetivo '${objective}' exige modernidade. Em '${file}', padrões legados retardam a evolução da 'Orquestração de Inteligência Artificial'.`
            };
        }
        return null;
    }

    getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, mestre em inovação e modernização de código TypeScript.`;
    }
}
