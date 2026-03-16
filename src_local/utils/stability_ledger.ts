import winston from "winston";
import { Path } from "../core/path_utils.ts";
import { MemoryPersistence } from "../agents/Support/Core/memory_persistence.ts";

const logger = winston.child({ module: "StabilityLedger" });

/**
 * 🏥 Livro de Estabilidade PhD (Bun Version).
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
        logger.info("💾 [Ledger] Sincronizando livro de estabilidade...");
        this.persistence.saveLedger(this.ledger);
    }

    update(auditResults: any[], contextMap: Record<string, any> = {}): Record<string, any> {
        try {
            this.performMaintenance();
            const currentErrorFiles = this.processAuditResults(auditResults, contextMap);
            this.detectHealedFiles(currentErrorFiles);

            this.persistence.saveLedger(this.ledger);
            return this.ledger;
        } catch (e: any) {
            logger.error(`🚨 Falha ao atualizar livro de estabilidade: ${e.message}`);
            return this.ledger;
        }
    }

    private performMaintenance() {
        const isInternal = this.projectRoot.toString().includes("Personas_Agentes");
        if (!isInternal && this.ledger[".agent/skills"]) {
            delete this.ledger[".agent/skills"];
        }
    }

    private processAuditResults(results: any[], contextMap: any): Set<string> {
        const currentErrorFiles = new Set<string>();
        results.forEach(issue => {
            const file = this.extractFileName(issue);
            currentErrorFiles.add(file);
            this.updateFileStatus(file, contextMap);
        });
        return currentErrorFiles;
    }

    private extractFileName(issue: any): string {
        if (typeof issue === 'object' && issue !== null && issue.file) {
            return String(issue.file).replace(/\\/g, "/");
        }
        return "Strategic/DNA";
    }

    private updateFileStatus(file: string, contextMap: Record<string, any>) {
        if (this.tryMarkReference(file, contextMap)) return;

        const entry = this.ledger[file] || { occurrences: 0, history: [], status: "UNSTABLE" };
        entry.occurrences += 1;
        entry.history.push(new Date().toISOString());

        // Only set status to UNSTABLE if it's not a REFERENCE
        if (entry.status !== "REFERENCE") {
            entry.status = "UNSTABLE";
        }

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
                this.markAsHealed(file);
            }
        });
    }

    private markAsHealed(file: string) {
        logger.info(`✨ [Memória] Cura confirmada: ${file}`);
        this.ledger[file].status = "HEALED";
        this.ledger[file].occurrences = 0;
    }

    private isHealable(file: string, currentErrors: Set<string>): boolean {
        const entry = this.ledger[file];
        if (file === "Strategic/DNA" || entry.status === "REFERENCE") return false;
        return !currentErrors.has(file) && entry.status !== "HEALED";
    }

    clear() {
        this.ledger = this.filterLedgerByStatus("REFERENCE");
        this.persistence.saveLedger(this.ledger);
        logger.info("🧹 [StabilityLedger] Memória de instabilidade resetada.");
    }

    private filterLedgerByStatus(status: string): Record<string, any> {
        return Object.fromEntries(
            Object.entries(this.ledger).filter(([_, v]) => v.status === status)
        );
    }

    getFileData(filePath: string): any {
        return this.persistence.getFileMetadata(this.ledger, filePath);
    }

    registerDisparity(disparity: { source: string, target: string, discrepancies: string[], severity: string }) {
        const file = disparity.source.replace(/\\/g, "/");
        const entry = this.ledger[file] || { occurrences: 0, history: [], status: "UNSTABLE" };
        
        entry.status = "DISPARITY";
        entry.occurrences += 1;
        entry.history.push(`[PARITY ERROR] Disparidade com ${disparity.target}: ${disparity.discrepancies.join("; ")}`);
        entry.meta = { ...entry.meta, lastSiblingDisparity: disparity.target, severity: disparity.severity };

        this.ledger[file] = entry;
        this.persistence.saveLedger(this.ledger);
        logger.warn(`⚖️ [Ledger] Disparidade registrada para ${file}`);
    }
}
