import winston from "winston";
import { HubManagerGRPC } from "../../core/hub_manager_grpc.ts";

const logger = winston.child({ module: "LogicAuditor" });

/**
 * 🕵️ LogicAuditor — PhD in Logical Integrity & Semantic Pattern Matching (gRPC Proxy).
 */
export class LogicAuditor {
    constructor(private hubManager?: HubManagerGRPC) {}

    /**
     * Realiza uma auditoria completa no arquivo via motor Rust AST.
     */
    async scanFile(filename: string, content?: string): Promise<any[]> {
        if (!this.hubManager) {
            logger.warn(`⚠️ [LogicAuditor] HubManager not provided for ${filename}`);
            return [];
        }

        try {
            const result = await this.hubManager.analyzeFile(filename, content);
            if (!result || !result.findings) return [];

            return result.findings.map((f: any) => ({
                file: filename,
                line: f.line,
                issue: f.message,
                severity: f.severity.toLowerCase(),
                category: f.category,
                context: "LogicAuditor (Rust AST)",
                snippet: f.snippet || ""
            }));
        } catch (error) {
            logger.error(`❌ [LogicAuditor] Hub analysis failed for ${filename}: ${error}`);
            return [];
        }
    }

    /**
     * Valida se uma interação (linha de código) é segura.
     */
    static isInteractionSafe(content: string, fileName: string): { isSafe: boolean, reason: string } {
        // This could also be migrated to Rust in the future
        const dangerous = ["eval(", "exec(", "child_process.execSync"];
        for (const d of dangerous) {
            if (content.includes(d)) return { isSafe: false, reason: `Uso de ${d} detectado.` };
        }
        return { isSafe: true, reason: "" };
    }
}
