import winston from "winston";

const logger = winston.child({ module: "ComponentClassifier" });

/**
 * Assistente Técnico: Especialista em Topologia de Arquivos 🗂️ (Bun Version).
 */
export class ComponentClassifier {
    mapType(relPath: string): string {
        logger.debug(`Classifying component: ${relPath}`);
        const p = relPath.toLowerCase();

        if (p.endsWith("__init__.py")) return "PACKAGE_MARKER";
        if (p.includes("test")) return "TEST";

        const rules: [((p: string) => boolean), string][] = [
            [this.isDoc, "DOC"],
            [this.isConfig, "CONFIG"],
            [this.isCore, "CORE"],
            [this.isAgent, "AGENT"],
            [this.isUtil, "UTIL"],
            [this.isInterface, "INTERFACE"],
            [this.isData, "DATA"]
        ];

        for (const [condition, result] of rules) {
            if (condition.call(this, p)) return result;
        }
        return "LOGIC";
    }

    private isDoc(p: string): boolean {
        return ["audit", "forensics", "report", "diagnostic", "restore", "temp", "debug", "fix_"].some(x => p.includes(x));
    }

    private isConfig(p: string): boolean {
        return ["settings", "config", "manifest", ".json", ".yaml", ".yml"].some(x => p.includes(x));
    }

    private isCore(p: string): boolean {
        return p.includes("core") || p.includes("domain");
    }

    private isAgent(p: string): boolean {
        return p.includes("agent/") || p.startsWith("agent_") || (p.endsWith(".py") && p.includes("agent") && !p.includes("personas"));
    }

    private isUtil(p: string): boolean {
        return p.includes("util") || p.includes("helper");
    }

    private isInterface(p: string): boolean {
        return ["ui", "screen", "layout", "gui", "view"].some(x => p.includes(x));
    }

    private isData(p: string): boolean {
        return p.includes("data") || p.includes("repository");
    }
}
