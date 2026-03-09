import { BaseActivePersona, AuditRule, StrategicFinding } from "../../base.ts";
import winston from "winston";

const logger = winston.child({ module: "Bun_Plugin" });

/**
 * 🔌 Dr. Plugin — PhD in Bun Bundler Plugins & Loader System
 * Especialista em plugins Bun.build, loaders customizados e resolve hooks.
 */
export class PluginPersona extends BaseActivePersona {
    constructor(projectRoot: string | null = null) {
        super(projectRoot);
        this.name = "Plugin";
        this.emoji = "🔌";
        this.role = "PhD Bun Plugin Architect";
        this.stack = "Bun";
    }

    getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: ['.ts', '.tsx'],
            rules: [
                { regex: /Bun\.plugin\(/, issue: 'Plugin Bun: Detectado plugin customizado — verifique lifecycle hooks.', severity: 'low' },
                { regex: /plugin\([^)]*setup[^)]*\)(?![\s\S]{0,100}onResolve|onLoad)/, issue: 'Plugin Incompleto: Bun.plugin sem onResolve ou onLoad — sem efeito.', severity: 'high' },
                { regex: /loader:\s*["'](?:js|jsx|ts|tsx|json|toml|text|wasm)["']/, issue: 'Loader: Loader customizado para tipo já suportado nativamente.', severity: 'medium' },
                { regex: /import.*\.wasm/, issue: 'WASM: Import de módulo WASM — Bun suporta nativamente, verifique typing.', severity: 'low' },
            ]
        };
    }

    reasonAboutObjective(objective: string, file: string, content: string | Promise<string | null>): StrategicFinding | string | null {
        if (typeof content !== 'string') return null;
        if (/Bun\.plugin\(/.test(content)) {
            return {
                file, severity: "LOW",
                issue: `Extensibilidade: O objetivo '${objective}' depende de plugins. Em '${file}', verifique que os hooks onResolve/onLoad estão implementados corretamente.`,
                context: "Bun.plugin usage detected"
            };
        }
        return null;
    }

    getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, mestre em plugins de bundler e loaders Bun.`;
    }
}
