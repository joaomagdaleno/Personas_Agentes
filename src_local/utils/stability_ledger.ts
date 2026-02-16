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
        } catch (e) {
            logger.error(`🚨 Falha ao atualizar livro de estabilidade: ${e}`);
            return this.ledger;
        }
    }

    private updateFileStatus(file: string, contextMap: Record<string, any>) {
        if (contextMap[file]?.is_gold_standard) {
            if (!this.ledger[file]) {
                this.ledger[file] = { status: "REFERENCE", history: ["Identificado como Gold Standard"] };
            }
            return;
        }

        if (!this.ledger[file]) {
            this.ledger[file] = { occurrences: 0, history: [], status: "UNSTABLE" };
        }

        this.ledger[file].occurrences += 1;
        this.ledger[file].history.push(new Date().toISOString());
        this.ledger[file].status = "UNSTABLE";
    }

    private detectHealedFiles(currentErrors: Set<string>) {
        for (const file of Object.keys(this.ledger)) {
            if (file === "Strategic/DNA" || this.ledger[file].status === "REFERENCE") {
                continue;
            }

            if (!currentErrors.has(file) && this.ledger[file].status !== "HEALED") {
                logger.info(`✨ [Memória] Cura confirmada: ${file}`);
                this.ledger[file].status = "HEALED";
                this.ledger[file].occurrences = 0;
            }
        }
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
