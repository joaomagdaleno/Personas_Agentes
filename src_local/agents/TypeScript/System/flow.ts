import { BaseActivePersona } from "../../base_persona.ts";
import winston from "winston";

const logger = winston.child({ module: "TS_Flow" });

/**
 * 🔄 Dr. Flow — PhD in TypeScript Control Flow & Async Patterns
 * Especialista em callback hell, async/await, e fluxos de controle complexos.
 */
export class FlowPersona extends BaseActivePersona {
    constructor(projectRoot: string | null = null) {
        super(projectRoot);
        this.name = "Flow";
        this.emoji = "🔄";
        this.role = "PhD Control Flow Architect";
        this.stack = "TypeScript";
    }

    async performAudit(): Promise<any[]> {
        const start = Date.now();
        logger.info(`[${this.name}] Analisando Fluxos de Controle TypeScript...`);

        const auditRules = [
            { regex: '\\.then\\([^)]*\\)\\.then\\([^)]*\\)\\.then', issue: 'Callback Hell: Cadeia .then().then().then() — use async/await.', severity: 'high' },
            { regex: 'if\\s*\\([^)]+\\)\\s*\\{[^}]*if\\s*\\([^)]+\\)\\s*\\{[^}]*if', issue: 'Pirâmide: Aninhamento profundo de ifs — refatore com early returns.', severity: 'medium' },
            { regex: 'switch\\s*\\([^)]*\\)\\s*\\{(?:[^}]*case[^}]*){10,}', issue: 'Switch Monolítico: Muitos cases — use padrão Strategy ou Map.', severity: 'medium' },
            { regex: 'Promise\\.all\\([^)]*\\.map\\(async', issue: 'Risco de Paralismo: Promise.all com map assíncrono sem limite de concorrência.', severity: 'medium' },
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
                issue: `Entropia Lógica: O objetivo '${objective}' exige clareza. Em '${file}', callback hell obscurece o fluxo da 'Orquestração de Inteligência Artificial'.`
            };
        }
        return null;
    }

    getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, mestre em fluxos de controle e arquitetura assíncrona TypeScript.`;
    }
}
