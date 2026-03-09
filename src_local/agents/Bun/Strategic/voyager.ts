import { BaseActivePersona, AuditRule, StrategicFinding } from "../../base.ts";
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

    getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: ['.ts', '.tsx'],
            rules: [
                { regex: /\brequire\s*\((?!["']bun:)/, issue: 'Legado: require() CommonJS — Bun favorece import ESM.', severity: 'high' },
                { regex: /module\.exports/, issue: 'Legado: module.exports CommonJS — use export ESM.', severity: 'high' },
                { regex: /__dirname|__filename/, issue: 'Legado Node: Use import.meta.dir e import.meta.file em Bun.', severity: 'high' },
                { regex: /process\.env/, issue: 'Legado Node: Considere Bun.env para variáveis de ambiente Bun-nativas.', severity: 'low' },
                { regex: /\bvar\s+\w+/, issue: 'Legado JS: "var" — use "const" ou "let".', severity: 'medium' },
            ]
        };
    }

    reasonAboutObjective(objective: string, file: string, content: string | Promise<string | null>): StrategicFinding | string | null {
        if (typeof content !== 'string') return null;
        if (/__dirname|__filename|require\s*\(/.test(content)) {
            return {
                file, severity: "HIGH",
                issue: `Débito Tecnológico: O objetivo '${objective}' exige Bun nativo. Em '${file}', APIs Node.js legadas retardam a migração.`,
                context: "legacy Node APIs detected"
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

