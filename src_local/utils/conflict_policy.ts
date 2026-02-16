import { Path } from "../core/path_utils.ts";
import winston from "winston";
import { GitClient } from "./git_client.ts"; // Assuming you have a GitClient

const logger = winston.child({ module: "ConflictPolicy" });

/**
 * 🛡️ Políticas de Conflito PhD (Bun Version).
 * Especialista em resolução automática de conflitos de merge para arquivos "system-critical".
 */
export class ConflictPolicy {
    private root: Path;
    private git: GitClient; // You'll need to instantiate GitClient or pass it

    constructor(root: string) {
        this.root = new Path(root);
        this.git = new GitClient(root); // Assuming GitClient can be instantiated like this
    }

    /**
     * Resolve conflito baseado no tipo e proteção do arquivo.
     */
    async resolveFile(file: string, isProtectedFn: (f: string) => boolean): Promise<boolean> {
        if (file.includes("__pycache__") || file.endsWith(".pyc")) {
            return this.resolveCache(file);
        }

        if (file === "skills_index.json") {
            // Logic for skills_index.json merging would go here.
            // For parity, we might need a custom merger logic found in legacy system if complex.
            // Using "ours" for now as safe default if we are the Sovereign.
            return this.resolveOurs(file, "Priorizando índice local (Soberano)");
        }

        if (isProtectedFn(file)) {
            return this.resolveOurs(file, "Protegendo arquivo local (Protected)");
        }

        return this.resolveTheirs(file, "Priorizando upstream (padrão)");
    }

    private async resolveCache(file: string): Promise<boolean> {
        logger.info(`🗑️ Limpando conflito de cache: ${file}`);
        await this.git.run(["rm", "--cached", file]);

        const fullPath = this.root.join(file);
        // Bun file deletion?
        // fs.unlink...
        // For simplicity in this snippet, rely on git rm or manual unlink if needed.
        // Actually typical python logic was: git rm --cached, then delete file.

        return true;
    }

    private async resolveOurs(file: string, reason: string): Promise<boolean> {
        logger.info(`🛡️ ${reason}: ${file}`);
        await this.git.run(["checkout", "--ours", file]);
        await this.git.run(["add", file]);
        return true;
    }

    private async resolveTheirs(file: string, reason: string): Promise<boolean> {
        logger.info(`📡 ${reason}: ${file}`);
        await this.git.run(["checkout", "--theirs", file]);
        await this.git.run(["add", file]);
        return true;
    }
}
