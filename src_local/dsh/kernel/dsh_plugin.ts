import type { DshContext } from "./dsh_context.ts";

/**
 * 🐉 DshPlugin Contract
 *
 * Princípio fundamental do DeepSeek Harness (Cordis):
 * "Tudo é um plugin" — cada capacidade (ferramenta, persona, motor LLM,
 * logger de sessões ou telemetria) implementa este contrato.
 */
export interface DshPlugin {
    name: string;
    version?: string;
    description?: string;
    apply(ctx: DshContext): void | Promise<void>;
}

export class DshPluginManager {
    private plugins: Map<string, DshPlugin> = new Map();
    private ctx: DshContext;

    constructor(ctx: DshContext) {
        this.ctx = ctx;
    }

    /**
     * Registra e aplica um plugin no contexto compartilhado
     */
    public async register(plugin: DshPlugin): Promise<void> {
        if (this.plugins.has(plugin.name)) {
            console.warn(`⚠️ [DSH PluginManager] Plugin '${plugin.name}' já registrado. Substituindo...`);
        }
        this.plugins.set(plugin.name, plugin);
        await plugin.apply(this.ctx);
    }

    /**
     * Retorna a lista de todos os plugins registrados
     */
    public list(): DshPlugin[] {
        return Array.from(this.plugins.values());
    }

    /**
     * Verifica se um plugin específico está carregado
     */
    public has(name: string): boolean {
        return this.plugins.has(name);
    }
}
