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
            this.addIfPythonFile(p, d, pyFiles);
        }
        return pyFiles;
    }

    private addIfPythonFile(p: string, d: any, pyFiles: Record<string, any>) {
        if (p.endsWith('.py')) {
            pyFiles[p] = d;
        }
    }

    async *iterAuditableFiles(): AsyncGenerator<[string, string]> {
        for (const [relPath, metadata] of Object.entries(this.map)) {
            const content = await this.auditSingleFile(relPath, metadata);
            if (content) yield [relPath, content];
        }
    }

    private async auditSingleFile(relPath: string, metadata: any): Promise<string | null> {
        if (!this.shouldAudit(relPath, metadata)) return null;
        return await this.readFile(relPath);
    }

    private shouldAudit(relPath: string, metadata: any): boolean {
        const isIgnored = this.ignoredFiles.includes(relPath);
        const isTest = metadata.component_type === "TEST";
        return !isIgnored && !isTest;
    }

    private async readFile(relPath: string): Promise<string | null> {
        if (!this.projectRoot) return null;
        const absPath = this.projectRoot.join(relPath);

        try {
            return await this.getFileContent(absPath);
        } catch (e) {
            logger.warn(`⚠️ [Iterator] Falha ao ler ${relPath}: ${e}`);
            return null;
        }
    }

    private async getFileContent(path: Path): Promise<string | null> {
        if (await path.exists()) {
            return await Bun.file(path.toString()).text();
        }
        return null;
    }
}
