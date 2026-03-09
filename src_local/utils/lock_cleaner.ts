import * as fs from "node:fs";
import * as path from "node:path";
import winston from "winston";

const logger = winston.child({ module: "LockCleaner" });

/**
 * 🧹 LockCleaner — Helper for removing git locks.
 */
export class LockCleaner {
    static clear(cwd: string) {
        const gitDir = path.join(cwd, ".git");
        if (fs.existsSync(gitDir)) {
            this.clearRecursive(gitDir);
        }
    }

    private static clearRecursive(dir: string) {
        const list = fs.readdirSync(dir);
        for (const file of list) {
            const fullPath = path.join(dir, file);
            if (fs.statSync(fullPath).isDirectory()) {
                this.clearRecursive(fullPath);
            } else if (file.endsWith(".lock")) {
                fs.unlinkSync(fullPath);
                logger.info(`🧹 Trava removida: ${file}`);
            }
        }
    }
}
