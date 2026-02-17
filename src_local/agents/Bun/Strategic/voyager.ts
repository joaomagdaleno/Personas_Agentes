import { BaseActivePersona } from "../../base_persona.ts";
import winston from "winston";

const logger = winston.child({ module: "Bun_Voyager" });

/**
 * 🧭 Dr. Voyager — PhD in Bun Modernization & Node.js Legacy Detection
 * Especialista em migração Node→Bun, APIs legadas e CommonJS.
 */
export class VoyagerPersona extends BaseActivePersona {
    constructor(projectRoot: string | null = null) {
        super(projectRoot);
        this.name = "Voyager";
        this.emoji = "🧭";
        this.role = "PhD Bun Modernization Engineer";
        this.stack = "Bun";
    }

    async performAudit(): Promise<any[]> {
        const start = Date.now();
        logger.info(`[${this.name}] Analisando Modernidade Bun...`);

        const auditRules = [
            { regex: '\\brequire\\s*\\(["\'](?!bun:)', issue: 'Legado: require() CommonJS — Bun favorece import ESM.', severity: 'high' },
            { regex: 'module\\.exports', issue: 'Legado: module.exports CommonJS — use export ESM.', severity: 'high' },
            { regex: '__dirname|__filename', issue: 'Legado Node: Use import.meta.dir e import.meta.file em Bun.', severity: 'high' },
            { regex: 'process\\.env', issue: 'Legado Node: Considere Bun.env para variáveis de ambiente Bun-nativas.', severity: 'low' },
            { regex: '\\bvar\\s+\\w+', issue: 'Legado JS: "var" — use "const" ou "let".', severity: 'medium' },
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
        if (/__dirname|__filename|require\s*\(/.test(content)) {
            return {
                file, severity: "HIGH", persona: this.name,
                issue: `Débito Tecnológico: O objetivo '${objective}' exige Bun nativo. Em '${file}', APIs Node.js legadas retardam a migração.`
            };
        }
        return null;
    }

    getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, mestre em modernização e migração Node→Bun.`;
    }

    /** Parity: perform_active_healing — Heals legacy patterns in blind spots. */
    async perform_active_healing(blindSpots: string[]): Promise<void> {
        logger.info(`🧭 [Voyager] Análise de cura ativa em ${blindSpots.length} alvos.`);
        // In TS, healing is delegated to the orchestrator; this logs the intent.
    }

    /** Parity: suggest_auto_healing — Generates auto-healing suggestions from audit. */
    async suggest_auto_healing(): Promise<string[]> {
        const results = await this.performAudit();
        return results
            .filter(r => r.severity === "high")
            .map(r => `Migrar ${r.file}: ${r.issue}`);
    }
}
