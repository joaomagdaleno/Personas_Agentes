import type { PsaContext } from "./psa_context.ts";

export interface PsaPlugin {
    name: string;
    version: string;
    description?: string;
    apply(ctx: PsaContext): void | Promise<void>;
    teardown?(ctx: PsaContext): void | Promise<void>;
}

export class PsaPluginManager {
    private plugins: Map<string, PsaPlugin> = new Map();
    private pluginTools: Map<string, Set<string>> = new Map();
    private ctx: PsaContext;

    constructor(ctx: PsaContext) {
        this.ctx = ctx;
    }

    public async register(plugin: PsaPlugin): Promise<void> {
        if (this.plugins.has(plugin.name)) {
            console.warn(`⚠️ [PSA PluginManager] Plugin '${plugin.name}' já registrado. Descarregando anterior...`);
            await this.unregister(plugin.name);
        }

        this.plugins.set(plugin.name, plugin);
        const toolsBefore = new Set(this.ctx.tools.list().map(t => t.name));

        await plugin.apply(this.ctx);

        const toolsAfter = this.ctx.tools.list().map(t => t.name);
        const newlyAdded = toolsAfter.filter(t => !toolsBefore.has(t));
        this.pluginTools.set(plugin.name, new Set(newlyAdded));
    }

    public async unregister(name: string): Promise<boolean> {
        const plugin = this.plugins.get(name);
        if (!plugin) return false;

        // Executar teardown do plugin se fornecido
        if (typeof plugin.teardown === "function") {
            try {
                await plugin.teardown(this.ctx);
            } catch (e: any) {
                console.error(`❌ [PSA PluginManager] Erro no teardown de '${name}':`, e.message);
            }
        }

        // Desregistrar ferramentas associadas ao plugin
        const tools = this.pluginTools.get(name);
        if (tools) {
            for (const toolName of tools) {
                this.ctx.tools.unregister(toolName);
            }
            this.pluginTools.delete(name);
        }

        this.plugins.delete(name);
        return true;
    }

    public has(name: string): boolean {
        return this.plugins.has(name);
    }

    public get(name: string): PsaPlugin | undefined {
        return this.plugins.get(name);
    }

    public list(): Array<{ name: string; version: string; description?: string }> {
        return Array.from(this.plugins.values()).map(p => ({
            name: p.name,
            version: p.version,
            description: p.description
        }));
    }

    public listDetailed(): Array<{ name: string; version: string; description?: string; tools: string[]; toolsCount: number }> {
        return Array.from(this.plugins.values()).map(p => {
            const tools = Array.from(this.pluginTools.get(p.name) || []);
            return {
                name: p.name,
                version: p.version,
                description: p.description,
                tools,
                toolsCount: tools.length
            };
        });
    }
}

// Compatibilidade
export type DshPlugin = PsaPlugin;
export { PsaPluginManager as DshPluginManager };
