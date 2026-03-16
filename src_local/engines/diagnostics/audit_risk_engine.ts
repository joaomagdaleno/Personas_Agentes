/**
 * SISTEMA DE PERSONAS AGENTES - SUPORTE TÉCNICO
 */
import winston from "winston";

const logger = winston.child({ module: "AuditRiskEngine" });

export type RiskType = "eval" | "shell" | "global" | "debug" | "except" | "print" | "crypto" | "network";

export interface RiskEntry {
    file: string; line: number; issue: string; severity: string; context: string; snippet: string; riskType: RiskType;
}

/**
 * 🎯 AuditRiskEngine — Motor de classificação e mapeamento de risco.
 */
export class AuditRiskEngine {
    private readonly RISK_MAP: Array<{ pattern: RegExp; type: RiskType; baseSeverity: string }> = [
        { pattern: /eval\s*\(/, type: "eval", baseSeverity: "CRITICAL" },
        { pattern: /exec\s*\(/, type: "eval", baseSeverity: "CRITICAL" },
        { pattern: /shell\s*[:=]\s*true/i, type: "shell", baseSeverity: "CRITICAL" },
        { pattern: /subprocess|child_process/, type: "shell", baseSeverity: "HIGH" },
        { pattern: /global\s+(var|let|const)/, type: "global", baseSeverity: "MEDIUM" },
        { pattern: /debugger\s*;/, type: "debug", baseSeverity: "MEDIUM" },
        { pattern: /console\.debug/, type: "debug", baseSeverity: "LOW" },
        { pattern: /except\s*:\s*pass/, type: "except", baseSeverity: "HIGH" },
        { pattern: /catch\s*\([^)]*\)\s*\{\s*\}/, type: "except", baseSeverity: "HIGH" },
        { pattern: /crypto\.(create|random)/, type: "crypto", baseSeverity: "MEDIUM" },
        { pattern: /fetch\s*\(|https?:\/\//, type: "network", baseSeverity: "MEDIUM" },
    ];

    /**
     * 🔍 Mapeia o tipo de risco a partir de um padrão regex.
     */
    mapRiskType(regex: string): RiskType {
        const reg = regex.toLowerCase();

        const typeMap: Record<string, RiskType> = {
            "eval": "eval", "shell": "shell", "global": "global", "debug": "debug",
            "except": "except", "catch": "except", "crypto": "crypto",
            "fetch": "network", "http": "network"
        };

        for (const [key, type] of Object.entries(typeMap)) {
            if (reg.includes(key)) return type;
        }
        return "print";
    }

    /**
     * 🏗️ Cria uma entrada de risco estruturada.
     */
    createEntry(file: string, lineIndex: number, issue: string, lines: string[], severityOverride?: string): RiskEntry {
        const start = Math.max(0, lineIndex - 2);
        const end = Math.min(lines.length, lineIndex + 3);
        const riskType = this.mapRiskType(issue);
        const severity = (severityOverride || this._inferSeverity(riskType)).toUpperCase();

        return {
            file, line: lineIndex + 1, issue, severity,
            context: "AuditRiskEngine", snippet: lines.slice(start, end).join("\n"), riskType,
        };
    }

    /**
     * 📊 Escaneia um arquivo inteiro em busca de riscos.
     */
    scanFile(content: string, filePath: string): RiskEntry[] {
        const lines = content.split("\n");
        const entries: RiskEntry[] = [];

        for (let i = 0; i < lines.length; i++) {
            this.scanLine(lines, i, filePath, entries);
        }

        logger.debug(`🎯 ${filePath}: ${entries.length} riscos detectados`);
        return entries;
    }

    private scanLine(lines: string[], i: number, filePath: string, entries: RiskEntry[]) {
        for (const rule of this.RISK_MAP) {
            if (rule.pattern.test(lines[i]!)) {
                entries.push(this.createRuleEntry(filePath, i, rule, lines));
            }
        }
    }

    private createRuleEntry(file: string, i: number, rule: any, lines: string[]): RiskEntry {
        return {
            file,
            line: i + 1,
            issue: `Padrão de risco detectado: ${rule.type}`,
            severity: rule.baseSeverity,
            context: "AuditRiskEngine",
            snippet: lines.slice(Math.max(0, i - 1), Math.min(lines.length, i + 2)).join("\n"),
            riskType: rule.type,
        };
    }

    private _inferSeverity(riskType: RiskType): string {
        const severityMap: Record<RiskType, string> = {
            eval: "CRITICAL", shell: "CRITICAL", global: "MEDIUM",
            debug: "LOW", except: "HIGH", print: "LOW",
            crypto: "MEDIUM", network: "MEDIUM",
        };
        return severityMap[riskType] || "MEDIUM";
    }
}
