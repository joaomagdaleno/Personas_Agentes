import { BaseActivePersona } from "../../base.ts";
import type { AuditFinding, AuditRule, StrategicFinding, ProjectContext } from "../../base.ts";

/**
 * 🔌 Dr. Plugin — PhD in Bun Bundler Plugins & Loader System
 * Especialista em plugins Bun.build, loaders customizados e resolve hooks.
 */
export class PluginPersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Plugin";
        this.emoji = "🔌";
        this.role = "PhD Bun Plugin Architect";
        this.phd_identity = "Bun.build Plugins & Loader Extensions";
        this.stack = "Bun";
    }

    public override async execute(context: ProjectContext): Promise<(AuditFinding | StrategicFinding)[]> {
        this.setContext(context);
        const findings: (AuditFinding | StrategicFinding)[] = await this.performAudit();
        return findings;
    }

    override getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: ['.ts', '.tsx', '.js'],
            rules: [
                { regex: /Bun\.plugin\(/, issue: 'Plugin Bun: Detectado plugin customizado — verifique lifecycle hooks PhD.', severity: 'low' },
                { regex: /plugin\([^)]*setup[^)]*\)(?![\s\S]{0,100}onResolve|onLoad)/, issue: 'Plugin Incompleto: Bun.plugin sem onResolve ou onLoad — sem efeito PhD.', severity: 'high' },
                { regex: /loader:\s*["'](?:js|jsx|ts|tsx|json|toml|text|wasm)["']/, issue: 'Loader: Loader customizado para tipo já suportado nativamente pelo Bun PhD.', severity: 'medium' },
                { regex: /import.*\.wasm/, issue: 'WASM: Import de módulo WASM — Bun suporta nativamente, verifique typing PhD.', severity: 'low' },
            ]
        };
    }

    public override async performAudit(): Promise<AuditFinding[]> {
        this.startMetrics();
        const rules = this.getAuditRules();
        const results = await this.findPatterns(rules.extensions, rules.rules);
        this.endMetrics(results.length);
        return results;
    }

    public override reasonAboutObjective(objective: string, file: string, content: string | Promise<string | null>): StrategicFinding | null {
        if (typeof content === 'string' && /Bun\.plugin\(/.test(content)) {
            return {
                file, severity: "LOW",
                issue: `Extensibilidade: O objetivo '${objective}' depende de plugins. Em '${file}', verifique se os hooks onResolve/onLoad estão implementados corretamente PhD.`,
                context: "Bun.plugin usage detected"
            };
        }
        return {
            file, severity: "INFO",
            issue: `PhD Plugin (Bun): Analisando extensibilidade e interceptação de build para ${objective}.`,
            context: this.name
        };
    }

    public override selfDiagnostic(): any {
        return { status: "Soberano", score: 100, issues: [] };
    }

    public override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, mestre em plugins de bundler e loaders Bun.`;
    }
}
