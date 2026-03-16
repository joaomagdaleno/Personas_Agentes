/**
 * SISTEMA DE PERSONAS AGENTES - SUPORTE TÉCNICO
 * Módulo: Detector de Erros Silenciados (SilentErrorDetector)
 */
import winston from "winston";
import { HubManagerGRPC } from "../../../core/hub_manager_grpc.ts";

const logger = winston.child({ module: "SilentErrorDetector" });

export interface SilentErrorIssue {
    file: string; line: number; issue: string; severity: string; context: string; snippet: string;
}

/**
 * 🔇 SilentErrorDetector — Detecta padrões de falha lógica silenciosa.
 */
export class SilentErrorDetector {
    constructor(private hubManager?: HubManagerGRPC) {}

    async detect(content: string, filePath: string): Promise<SilentErrorIssue[]> {
        if (filePath.includes("silent_error_detector.ts")) return [];
        
        if (!this.hubManager) {
            logger.warn("⚠️ HubManager not provided to SilentErrorDetector, falling back to empty results.");
            return [];
        }

        const result = await this.hubManager.analyzeFile(filePath, content);
        if (!result || !result.findings) return [];

        const issues: SilentErrorIssue[] = result.findings
            .filter((f: any) => f.category === "SILENT_ERROR")
            .map((f: any) => ({
                file: filePath,
                line: f.line,
                issue: f.message,
                severity: f.severity === "CRITICAL" ? "HIGH" : "MEDIUM",
                context: "SilentErrorDetector (AST)",
                snippet: f.snippet || ""
            }));

        if (issues.length > 0) {
            logger.debug(`🔇 ${issues.length} silent errors detected via AST in: ${filePath}`);
        }

        return issues;
    }
}
