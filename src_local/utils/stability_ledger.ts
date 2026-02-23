import winston from "winston";
import { Path } from "../core/path_utils.ts";
import { MemoryPersistence } from "../agents/Support/Core/memory_persistence.ts";

const logger = winston.child({ module: "StabilityLedger" });

/**
 * 🏥 Livro de Estabilidade PhD (Bun Version).
 * A memória de longo prazo do Orquestrador.
 */
export class StabilityLedger {
    projectRoot: Path;
    persistence: MemoryPersistence;
    ledger: Record<string, any>;

    constructor(projectRoot: string) {
        this.projectRoot = new Path(projectRoot);
        const storagePath = this.projectRoot.join(".gemini", "stability_ledger.json");

        this.persistence = new MemoryPersistence(storagePath);
        this.ledger = this.persistence.loadLedger();
    }

    async sync() {
        /** 🔄 Sincronização explícita com o disco. */
        logger.info("💾 [Ledger] Sincronizando livro de estabilidade com armazenamento...");
        this.persistence.saveLedger(this.ledger);
    }

    update(auditResults: any[], contextMap: Record<string, any> = {}): Record<string, any> {
        /** 📈 Sincroniza os achados da auditoria com a memória persistente. */
        const currentErrorFiles = new Set<string>();
        const isInternal = this.projectRoot.toString().includes("Personas_Agentes");

        try {
            // Limpeza preventiva para projetos externos
            if (!isInternal && this.ledger[".agent/skills"]) {
                delete this.ledger[".agent/skills"];
            }

            for (const issue of auditResults) {
                const file = (typeof issue === 'object' && issue !== null)
                    ? String(issue.file || 'N/A').replace(/\\/g, "/")
                    : "Strategic/DNA";
                currentErrorFiles.add(file);
                this.updateFileStatus(file, contextMap);
            }

            // Detecção de CURA
            this.detectHealedFiles(currentErrorFiles);

            this.persistence.saveLedger(this.ledger);
            return this.ledger;
        } catch (e: any) {
            logger.error(`🚨 Falha ao atualizar livro de estabilidade: ${e.message}`);
            return this.ledger;
        }
    }

    private updateFileStatus(file: string, contextMap: Record<string, any>) {
        if (this.tryMarkReference(file, contextMap)) return;

        const entry = this.ledger[file] || { occurrences: 0, history: [], status: "UNSTABLE" };
        entry.occurrences += 1;
        entry.history.push(new Date().toISOString());
        entry.status = "UNSTABLE";
        this.ledger[file] = entry;
    }

    private tryMarkReference(file: string, contextMap: Record<string, any>): boolean {
        if (contextMap[file]?.is_gold_standard) {
            this.ledger[file] ||= { status: "REFERENCE", history: ["Identificado como Gold Standard"] };
            return true;
        }
        return false;
    }

    private detectHealedFiles(currentErrors: Set<string>) {
        Object.keys(this.ledger).forEach(file => {
            if (this.isHealable(file, currentErrors)) {
                logger.info(`✨ [Memória] Cura confirmada: ${file}`);
                this.ledger[file].status = "HEALED";
                this.ledger[file].occurrences = 0;
            }
        });
    }

    private isHealable(file: string, currentErrors: Set<string>): boolean {
        const entry = this.ledger[file];
        if (file === "Strategic/DNA" || entry.status === "REFERENCE") return false;
        return !currentErrors.has(file) && entry.status !== "HEALED";
    }

    clear() {
        /** 🧹 Limpa a memória de instabilidade (Mantém REFERÊNCIAS). */
        const newLedger: Record<string, any> = {};
        for (const [k, v] of Object.entries(this.ledger)) {
            if (v.status === "REFERENCE") {
                newLedger[k] = v;
            }
        }
        this.ledger = newLedger;
        this.persistence.saveLedger(this.ledger);
        logger.info("🧹 [StabilityLedger] Memória de instabilidade resetada.");
    }

    getFileData(filePath: string): any {
        return this.persistence.getFileMetadata(this.ledger, filePath);
    }
}
