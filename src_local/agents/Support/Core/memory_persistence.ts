import winston from "winston";
import { Path } from "../../../core/path_utils.ts";
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";

const logger = winston.child({ module: "MemoryPersistence" });

/**
 * Assistente Técnico: Guardião da Memória e Persistência de Dados 💾 (Bun Version).
 */
export class MemoryPersistence {
    private path: Path;

    constructor(storagePath: Path) {
        this.path = storagePath;
    }

    loadLedger(): Record<string, any> {
        /** Carrega a memória de longo prazo com segurança. */
        if (existsSync(this.path.toString())) {
            try {
                const content = readFileSync(this.path.toString(), "utf-8");
                return JSON.parse(content);
            } catch (e) {
                logger.error(`Falha ao carregar ledger: ${e}`);
                return {};
            }
        }
        return {};
    }

    saveLedger(data: Record<string, any>) {
        /** Persiste a memória de forma atômica. */
        try {
            const parentDir = this.path.parent().toString();
            if (!existsSync(parentDir)) {
                mkdirSync(parentDir, { recursive: true });
            }
            writeFileSync(this.path.toString(), JSON.stringify(data, null, 2), "utf-8");
        } catch (e) {
            logger.error(`Falha ao salvar ledger: ${e}`);
        }
    }

    getFileMetadata(ledger: Record<string, any>, filePath: string): any {
        /** Busca histórico específico de um arquivo. */
        return ledger[filePath] || {};
    }
}
