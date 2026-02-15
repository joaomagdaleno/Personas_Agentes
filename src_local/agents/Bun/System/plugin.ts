import { BaseActivePersona } from "../../base_persona.ts";
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

    async performAudit(): Promise<any[]> {
        const start = Date.now();
        logger.info(`[${this.name}] Analisando Plugins Bun...`);

        const auditRules = [
            { regex: 'Bun\\.plugin\\(', issue: 'Plugin Bun: Detectado plugin customizado — verifique lifecycle hooks.', severity: 'low' },
            { regex: 'plugin\\([^)]*setup[^)]*\\)(?![\\s\\S]{0,100}onResolve|onLoad)', issue: 'Plugin Incompleto: Bun.plugin sem onResolve ou onLoad — sem efeito.', severity: 'high' },
            { regex: 'loader:\\s*["\'](?:js|jsx|ts|tsx|json|toml|text|wasm)["\']', issue: 'Loader: Loader customizado para tipo já suportado nativamente.', severity: 'medium' },
            { regex: 'import.*\\.wasm', issue: 'WASM: Import de módulo WASM — Bun suporta nativamente, verifique typing.', severity: 'low' },
        ];

        const results: any[] = [];
        for (const rule of auditRules) {
            const regex = new RegExp(rule.regex, 'gs');
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
        if (/Bun\.plugin\(/.test(content)) {
            return {
                file, severity: "LOW", persona: this.name,
                issue: `Extensibilidade: O objetivo '${objective}' depende de plugins. Em '${file}', verifique que os hooks onResolve/onLoad estão implementados corretamente.`
            };
        }
        return null;
    }

    getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, mestre em plugins de bundler e loaders Bun.`;
    }
}
