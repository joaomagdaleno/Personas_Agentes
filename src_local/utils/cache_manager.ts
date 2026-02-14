import winston from "winston";
import { Path } from "../core/path_utils.ts";
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";

const logger = winston.child({ module: "CacheManager" });

/**
 * 🗄️ Gerenciador de Cache de Integridade PhD (Bun Version).
 */
export class CacheManager {
    projectRoot: Path;
    cacheFile: Path;
    currentCache: Record<string, string> = {};

    constructor(projectRoot: string) {
        this.projectRoot = new Path(projectRoot);
        this.cacheFile = this.projectRoot.join(".gemini", "cache", "audit_cache.json");
        this.currentCache = this.load();
    }

    private load(): Record<string, string> {
        if (existsSync(this.cacheFile.toString())) {
            try {
                const content = readFileSync(this.cacheFile.toString(), "utf-8");
                return JSON.parse(content);
            } catch (e) {
                logger.error(`🚨 [Cache] Falha ao carregar metadados: ${e}`);
            }
        }
        return {};
    }

    async getFileHash(filePath: Path | string): Promise<string> {
        const path = filePath instanceof Path ? filePath : new Path(filePath);
        if (!(await path.exists())) {
            return "";
        }
        try {
            // Bun.file(path).arrayBuffer() is fast for hashing
            const file = Bun.file(path.toString());
            const hasher = new Bun.CryptoHasher("sha256");
            const buffer = await file.arrayBuffer();
            hasher.update(buffer);
            return hasher.digest("hex");
        } catch (e) {
            logger.debug(`ℹ️ [Cache] Erro ao gerar hash de ${path.toString()}: ${e}`);
            return "";
        }
    }

    isChanged(relPath: string, newHash: string): boolean {
        return this.currentCache[relPath] !== newHash;
    }

    update(relPath: string, newHash: string) {
        this.currentCache[relPath] = newHash;
    }

    save() {
        try {
            const parentDir = this.cacheFile.parent().toString();
            if (!existsSync(parentDir)) {
                mkdirSync(parentDir, { recursive: true });
            }
            writeFileSync(this.cacheFile.toString(), JSON.stringify(this.currentCache, null, 4), "utf-8");
        } catch (e) {
            logger.error(`🚨 [Cache] Falha fatal ao salvar memória: ${e}`);
        }
    }
}
