import { BaseActivePersona } from "../../base_persona.ts";
import winston from "winston";

const logger = winston.child({ module: "Bun_Forge" });

/**
 * 🔨 Dr. Forge — PhD in Bun Code Safety & Compile-time Security
 * Especialista em segurança de compilação Bun, macros e execução dinâmica.
 */
export class ForgePersona extends BaseActivePersona {
    constructor(projectRoot: string | null = null) {
        super(projectRoot);
        this.name = "Forge";
        this.emoji = "🔨";
        this.role = "PhD Bun Compile Safety Engineer";
        this.stack = "Bun";
    }

    async performAudit(): Promise<any[]> {
        const start = Date.now();
        logger.info(`[${this.name}] Analisando Segurança de Compilação Bun...`);

        const auditRules = [
            { regex: '\\beval\\s*\\(', issue: 'Crítico: eval() permite execução arbitrária no runtime Bun.', severity: 'critical' },
            { regex: 'new\\s+Function\\s*\\(', issue: 'Risco: new Function() cria código em runtime Bun.', severity: 'critical' },
            { regex: 'import\\s*\\([^)]*\\+', issue: 'Risco: import() dinâmico com concatenação — risco de injeção.', severity: 'high' },
            { regex: 'Bun\\.build\\([^)]*\\)(?![\\s\\S]{0,100}minify)', issue: 'Otimização: Bun.build() sem minify — bundle pode ser grande.', severity: 'low' },
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
        if (/\beval\s*\(|new\s+Function\s*\(/.test(content)) {
            return {
                file, severity: "CRITICAL", persona: this.name,
                issue: `Risco de Autonomia: O objetivo '${objective}' exige segurança de compilação. Em '${file}', execução dinâmica compromete a soberania Bun.`
            };
        }
        return null;
    }

    getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, mestre em segurança de compilação e build Bun.`;
    }
}
