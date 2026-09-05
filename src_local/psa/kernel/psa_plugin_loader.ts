import * as fs from "node:fs";
import * as path from "node:path";
import type { PsaContext } from "./psa_context.ts";
import type { PsaPlugin } from "./psa_plugin.ts";

import { pathToFileURL } from "node:url";

/**
 * 🔌 PsaPluginLoader
 *
 * Carregador dinâmico de plugins do ecossistema PSA:
 * - Descoberta automática em diretórios (`plugins/`, `src_local/psa/plugins/*`)
 * - Suporte a hot-reload de plugins individuais sem reiniciar o kernel
 * - Validação de contrato de plugin antes do registro
 */
export class PsaPluginLoader {
    private ctx: PsaContext;

    constructor(ctx: PsaContext) {
        this.ctx = ctx;
    }

    /**
     * Carrega um plugin a partir de um arquivo TypeScript/JavaScript
     */
    public async loadFromFile(filePath: string): Promise<PsaPlugin | null> {
        try {
            const absolutePath = path.isAbsolute(filePath)
                ? filePath
                : path.resolve(this.ctx.workspaceRoot, filePath);

            if (!fs.existsSync(absolutePath)) {
                console.warn(`⚠️ [PSA PluginLoader] Arquivo não encontrado: ${absolutePath}`);
                return null;
            }

            // Import dinâmico compatível com Windows e POSIX via URL
            const fileUrl = pathToFileURL(absolutePath).href;
            const mod = await import(fileUrl);

            // Procura por classes que implementam PsaPlugin
            for (const key of Object.keys(mod)) {
                const Exported = mod[key];
                if (typeof Exported === "function") {
                    try {
                        const instance = new Exported();
                        if (instance && typeof instance.apply === "function" && typeof instance.name === "string") {
                            await this.ctx.use(instance);
                            return instance;
                        }
                    } catch {
                        // Não é um construtor de plugin válido, prossegue
                    }
                }
            }

            return null;
        } catch (err: any) {
            console.error(`❌ [PSA PluginLoader] Falha ao carregar plugin de ${filePath}:`, err.message);
            return null;
        }
    }

    /**
     * Varre um diretório e carrega todos os plugins encontrados
     */
    public async loadFromDirectory(dirPath: string): Promise<PsaPlugin[]> {
        const loaded: PsaPlugin[] = [];
        const fullDir = path.isAbsolute(dirPath)
            ? dirPath
            : path.resolve(this.ctx.workspaceRoot, dirPath);

        if (!fs.existsSync(fullDir)) return loaded;

        try {
            const entries = await fs.promises.readdir(fullDir, { withFileTypes: true });
            for (const entry of entries) {
                const entryPath = path.join(fullDir, entry.name);
                if (entry.isFile() && (entry.name.endsWith(".ts") || entry.name.endsWith(".js"))) {
                    // Ignora arquivos de teste e declaração de tipos
                    if (entry.name.endsWith(".test.ts") || entry.name.endsWith(".d.ts") || entry.name === "index.ts") {
                        continue;
                    }
                    const plugin = await this.loadFromFile(entryPath);
                    if (plugin) loaded.push(plugin);
                } else if (entry.isDirectory()) {
                    const subLoaded = await this.loadFromDirectory(entryPath);
                    loaded.push(...subLoaded);
                }
            }
        } catch (err: any) {
            console.error(`❌ [PSA PluginLoader] Erro ao varrer diretório de plugins (${dirPath}):`, err.message);
        }

        return loaded;
    }

    /**
     * Recarrega um plugin existente (Hot-Reload)
     */
    public async reloadPlugin(pluginName: string, filePath: string): Promise<boolean> {
        if (this.ctx.plugins.has(pluginName)) {
            await this.ctx.plugins.unregister(pluginName);
        }
        const plugin = await this.loadFromFile(filePath);
        return plugin !== null;
    }
}
