import { BaseActivePersona } from "../../base_persona.ts";
import winston from "winston";

const logger = winston.child({ module: "TS_Forge" });

/**
 * 🔨 Dr. Forge — PhD in TypeScript Code Generation & Safety
 * Especialista em detecção de eval(), new Function() e execução dinâmica perigosa.
 */
export class ForgePersona extends BaseActivePersona {
    constructor(projectRoot: string | null = null) {
        super(projectRoot);
        this.name = "Forge";
        this.emoji = "🔨";
        this.role = "PhD Automation & Safety Engineer";
        this.stack = "TypeScript";
    }

    async performAudit(): Promise<any[]> {
        const start = Date.now();
        logger.info(`[${this.name}] Analisando Segurança de Code Generation TypeScript...`);

        const auditRules = [
            { regex: '\\beval\\s*\\(', issue: 'Vulnerabilidade Crítica: eval() permite execução arbitrária de código.', severity: 'critical' },
            { regex: 'new\\s+Function\\s*\\(', issue: 'Risco de Injeção: new Function() cria código em runtime.', severity: 'critical' },
            { regex: 'document\\.write\\s*\\(', issue: 'Inseguro: document.write pode injetar scripts maliciosos.', severity: 'high' },
            { regex: 'innerHTML\\s*=', issue: 'XSS Potencial: innerHTML sem sanitização permite injeção.', severity: 'high' },
            { regex: 'setTimeout\\s*\\(\\s*["\']', issue: 'eval Disfarçado: setTimeout com string executa código implícito.', severity: 'high' },
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
                issue: `Risco de Autonomia: O objetivo '${objective}' exige segurança de execução. Em '${file}', a execução dinâmica de código compromete a 'Orquestração de Inteligência Artificial'.`
            };
        }
        return null;
    }

    getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, mestre em automação e segurança de codegen TypeScript.`;
    }
}
