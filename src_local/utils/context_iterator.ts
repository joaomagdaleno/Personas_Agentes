import winston from "winston";
import { Path } from "../core/path_utils.ts";

const logger = winston.child({ module: "ContextIterator" });

/**
 * 🔄 Iterador de Contexto PhD (Bun Version).
 */
export class ContextIterator {
    projectRoot: Path | null;
    map: Record<string, any>;
    guardian: any;
    ignoredFiles: string[];
    stack: string;

    constructor(projectRoot: string | null, contextMap: Record<string, any>, options: { integrityGuardian?: any; ignoredFiles?: string[]; stack?: string } = {}) {
        this.projectRoot = projectRoot ? new Path(projectRoot) : null;
        this.map = contextMap;
        this.guardian = options.integrityGuardian;
        this.ignoredFiles = options.ignoredFiles || [];
        this.stack = options.stack || "Universal";
        logger.debug(`🔄 [Iterator] Inicializado para ${this.stack} com ${Object.keys(contextMap).length} itens.`);
    }

    getPyFiles(): Record<string, any> {
        const pyFiles: Record<string, any> = {};
        for (const [p, d] of Object.entries(this.map)) {
            if (p.endsWith('.py')) pyFiles[p] = d;
        }
        return pyFiles;
    }

    async *iterAuditableFiles(): AsyncGenerator<[string, string]> {
        for (const [relPath, metadata] of Object.entries(this.map)) {
            if (this.ignoredFiles.includes(relPath)) continue;
            if (metadata.component_type === "TEST") continue;

            const content = await this.readFile(relPath);
            if (content) {
                yield [relPath, content];
            }
        }
    }

    private async readFile(relPath: string): Promise<string | null> {
        if (!this.projectRoot) return null;
        const absPath = this.projectRoot.join(relPath);
        try {
            if (await absPath.exists()) {
                return await Bun.file(absPath.toString()).text();
            }
        } catch (e) {
            logger.warn(`⚠️ [Iterator] Falha ao ler ${relPath}: ${e}`);
        }
        return null;
    }
}
