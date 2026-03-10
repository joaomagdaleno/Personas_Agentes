import * as fs from "node:fs";
import * as path from "node:path";

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

    constructor(projectRoot: string) {
        this.registryDir = path.join(projectRoot, "agents_registry");
    }

    public async loadAllStacks(): Promise<Record<string, AgentEntry[]>> {
        const stacks: Record<string, AgentEntry[]> = {};
        if (!fs.existsSync(this.registryDir)) return stacks;

        const files = fs.readdirSync(this.registryDir).filter(f => f.endsWith(".json"));
        for (const file of files) {
            const stackName = path.basename(file, ".json");
            const capitalizedStack = stackName.charAt(0).toUpperCase() + stackName.slice(1);
            const content = JSON.parse(fs.readFileSync(path.join(this.registryDir, file), "utf-8"));
            stacks[capitalizedStack] = content;
        }
        return stacks;
    }

    public async getAgent(stack: string, name: string): Promise<AgentEntry | null> {
        const stacks = await this.loadAllStacks();
        const agents = stacks[stack] || [];
        return agents.find(a => a.name === name) || null;
    }
}
