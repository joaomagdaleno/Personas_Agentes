import { CognitiveEngine } from "./cognitive_engine";
import winston from "winston";

const logger = winston.child({ module: "CognitiveValidator" });

export interface CognitiveHealthReport {
    status: "HEALTHY" | "DEGRADED" | "FAIL";
    lazyLoading: boolean;
    reasoningSpeedMs: number;
    memoryReleased: boolean;
    response: string;
    error?: string;
}

/**
 * 🧠 CognitiveValidator — PhD in AI Sanity
 * Realiza testes de estresse e sanidade no SLM.
 */
export class CognitiveValidator {
    private engine: CognitiveEngine;

    constructor() {
        this.engine = new CognitiveEngine();
    }

    async runFullCheck(): Promise<CognitiveHealthReport> {
        logger.info("🧠 Iniciando auditoria de sanidade cognitiva...");
        const report: CognitiveHealthReport = {
            status: "HEALTHY",
            lazyLoading: false,
            reasoningSpeedMs: 0,
            memoryReleased: false,
            response: ""
        };

        try {
            // 1. Teste de Lazy Loading
            report.lazyLoading = (this.engine as any).model === undefined || (this.engine as any).model === null;

            // 2. Teste de Raciocínio
            const start = Date.now();
            const response = await this.engine.reason("Responda apenas com a palavra 'CONSCIENTE'.");
            report.reasoningSpeedMs = Date.now() - start;
            report.response = response || "";

            if (!response || !response.includes("CONSCIENTE")) {
                report.status = "DEGRADED";
            }

            // 3. Teste de Liberação
            await this.engine.release();
            report.memoryReleased = (this.engine as any).model === null;

            if (!report.memoryReleased) {
                report.status = "FAIL";
            }

        } catch (e: any) {
            logger.error(`🚨 Falha crítica no motor cognitivo: ${e.message}`);
            report.status = "FAIL";
            report.error = e.message;
        }

        return report;
    }
}
