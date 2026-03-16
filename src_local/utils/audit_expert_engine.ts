import winston from "winston";
import { HubManagerGRPC } from "../core/hub_manager_grpc.ts";

const logger = winston.child({ module: "AuditExpertEngine" });

export interface AuditEntry {
    file: string; line: number; issue: string; severity: string; context: string; snippet: string;
}

/**
 * 🔎 Audit Expert Engine PhD (Hub-Injected).
 * Engine responsável por consolidar achados do motor profundo nativo.
 */
export class AuditExpertEngine {
    private readonly RISK_MAP: Record<string, string> = {
        "eval": "CRITICAL", "exec": "CRITICAL", "system": "HIGH", "shell": "HIGH", "spawn": "HIGH",
        "global": "MEDIUM", "except": "MEDIUM", "catch": "MEDIUM", "debug": "LOW", "print": "LOW", "log": "LOW"
    };

    constructor(private hubManager?: HubManagerGRPC) {}

    /**
     * Agora utiliza o Hub gRPC em vez de loops de string locais.
     */
    public async scanDeep(file: string, content: string, agentName: string): Promise<AuditEntry[]> {
        if (!this.hubManager) return [];

        try {
            const analysis = await this.hubManager.analyzeFile(file, content);
            if (!analysis || !analysis.findings) return [];

            const lines = content.split('\n');

            return analysis.findings.map((f: any) => ({
                file,
                line: f.line,
                issue: f.message,
                severity: f.severity.toUpperCase(),
                context: agentName,
                snippet: this.getLinesWindow(lines, f.line - 1, f.message)
            }));
        } catch (e) {
            logger.error(`❌ [AuditEngine] Erro na auditoria profunda de ${file}: ${e}`);
            return [];
        }
    }

    private getLinesWindow(lines: string[], lineIdx: number, issue: string): string {
        const window = issue.toLowerCase().match(/if|try/) ? 5 : 2;
        const start = Math.max(0, lineIdx - window);
        const end = Math.min(lines.length, lineIdx + window + 1);
        return lines.slice(start, end).join("\n");
    }

    public mapRiskLevel(patternRegex: string | RegExp): string {
        const lower = String(patternRegex).toLowerCase();
        const found = Object.entries(this.RISK_MAP).find(([kw]) => lower.includes(kw));
        return found ? found[1] : "MEDIUM";
    }

    public _validate_risk_level(level: string): string {
        const valid = ["CRITICAL", "HIGH", "MEDIUM", "LOW", "STRATEGIC"];
        const upper = (level || "MEDIUM").toUpperCase();
        return valid.includes(upper) ? upper : "MEDIUM";
    }
}

export class AuditScannerEngine extends AuditExpertEngine { }
export class AuditRiskEngine extends AuditExpertEngine { }
export function map_risk_type(risk: string): string { return risk.toUpperCase(); }
