import { BaseActivePersona } from "../../base_persona.ts";
import winston from "winston";

const logger = winston.child({ module: "Bun_Flow" });

/**
 * 🔄 Dr. Flow — PhD in Bun Control Flow & Shell Scripting
 * Especialista em Bun.$ shell, Bun.spawn e fluxos de controle assíncronos.
 */
export class FlowPersona extends BaseActivePersona {
    constructor(projectRoot: string | null = null) {
        super(projectRoot);
        this.name = "Flow";
        this.emoji = "🔄";
        this.role = "PhD Bun Control Flow Architect";
        this.stack = "Bun";
    }

    async performAudit(): Promise<any[]> {
        const start = Date.now();
        logger.info(`[${this.name}] Analisando Fluxos de Controle Bun...`);

        const auditRules = [
            { regex: '\\.then\\([^)]*\\)\\.then\\([^)]*\\)\\.then', issue: 'Callback Hell: Cadeia .then() em Bun — use async/await.', severity: 'high' },
            { regex: 'Bun\\.spawn\\(\\[[^\\]]*\\]\\)(?![\\s\\S]{0,100}await)', issue: 'Fire-and-Forget: Bun.spawn sem await — processo pode não completar.', severity: 'high' },
            { regex: 'Bun\\.\\$`[^`]*`(?![\\s\\S]{0,50}await|try)', issue: 'Bun Shell: Bun.$ sem await ou try-catch — erro silenciado.', severity: 'medium' },
        ];

        const results: any[] = [];
        for (const rule of auditRules) {
            const regex = new RegExp(rule.regex, 'gs');
            for (const [filePath, content] of Object.entries(this.contextData)) {
                if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
                    for (const match of (content as string).matchAll(regex)) {
                        results.push({ file: filePath, issue: rule.issue, severity: rule.severity, evidence: match[0].substring(0, 80), persona: this.name });
                    }
                }
            }
        }

        const duration = (Date.now() - start) / 1000;
        logger.info(`[${this.name}] Auditoria concluída em ${duration.toFixed(4)}s. Achados: ${results.length}`);
        return results;
    }

    async reasonAboutObjective(objective: string, file: string, content: string): Promise<any | null> {
        if (/\.then\([^)]*\)\.then\([^)]*\)\.then/.test(content)) {
            return {
                file, severity: "HIGH", persona: this.name,
                issue: `Entropia: O objetivo '${objective}' exige clareza. Em '${file}', callback chains obscurecem o fluxo Bun.`
            };
        }
        return null;
    }

    getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, mestre em fluxos de controle e shell scripting Bun.`;
    }
}
