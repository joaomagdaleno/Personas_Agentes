import * as fs from "node:fs";
import * as path from "node:path";
import { DatabaseHub } from "./database_hub.ts";

export interface AgentEntry {
    name: string;
    version: string;
    status: string;
    category: string;
    capabilities: string[];
    dependencies: string[];
    updatedAt: string;
}

export class RegistryManager {
    private registryDir: string;
    private db: DatabaseHub;

    constructor(projectRoot: string) {
        this.registryDir = path.join(projectRoot, "agents_registry");
        this.db = DatabaseHub.getInstance(projectRoot);
    }

    public async loadAllStacks(): Promise<Record<string, AgentEntry[]>> {
        const stacks: Record<string, AgentEntry[]> = {};
        
        // Tentativa de carregar do cache do DB
        const cached = await this.db.get("agent_registry_cache");
        if (cached) {
            try {
                return JSON.parse(cached);
            } catch (e) {
                // Fallback to disk if cache corrupted
            }
        }

        if (!fs.existsSync(this.registryDir)) return stacks;

        const files = fs.readdirSync(this.registryDir).filter(f => f.endsWith(".json"));
        for (const file of files) {
            const stackName = path.basename(file, ".json");
            const capitalizedStack = stackName.charAt(0).toUpperCase() + stackName.slice(1);
            const content = JSON.parse(fs.readFileSync(path.join(this.registryDir, file), "utf-8"));
            stacks[capitalizedStack] = content;
        }

        // Atualizar cache
        await this.db.set("agent_registry_cache", JSON.stringify(stacks));
        return stacks;
    }

    public getAgentSiblings(agentPath: string): string[] {
        const basename = path.basename(agentPath, path.extname(agentPath));
        const siblings: string[] = [];
        const projectRoot = path.dirname(this.registryDir);

        // Busca dinâmica em todos os diretórios src_local e src_native (exceto node_modules/dist/target)
        const projectDirs = ["src_local", "src_native"];
        const extensions = [".ts", ".go", ".py", ".rs"];

        for (const base of projectDirs) {
            const fullPath = path.join(projectRoot, base);
            if (!fs.existsSync(fullPath)) continue;
            
            this.recursiveSearch(fullPath, basename, agentPath, extensions, siblings);
        }
        return siblings;
    }

    private recursiveSearch(dir: string, targetBase: string, excludePath: string, exts: string[], results: string[]) {
        const items = fs.readdirSync(dir, { withFileTypes: true });
        for (const item of items) {
            const fullPath = path.join(dir, item.name);
            if (item.isDirectory()) {
                if (item.name === "node_modules" || item.name === "target" || item.name === "dist") continue;
                this.recursiveSearch(fullPath, targetBase, excludePath, exts, results);
            } else if (item.isFile()) {
                const ext = path.extname(item.name);
                if (exts.includes(ext)) {
                    const fileBase = path.basename(item.name, ext);
                    if (fileBase === targetBase && fullPath !== excludePath) {
                        results.push(fullPath);
                    }
                }
            }
        }
    }
}
