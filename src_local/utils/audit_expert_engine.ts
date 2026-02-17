import winston from "winston";

const logger = winston.child({ module: "AuditExpertEngine" });

export interface AuditEntry {
    file: string;
    line: number;
    issue: string;
    severity: string;
    context: string;
    snippet: string;
}

/**
 * 🔎 Audit Expert Engine (High-Fidelity TypeScript Version).
 * Consolida legacy audit_risk_engine.py e audit_scanner_engine.py.
 * 
 * Melhorias sobre a versão legacy:
 * 1. Mapeamento de risco extensível via dicionário de tipos.
 * 2. Extração de snippet inteligente com janelas de contexto dinâmicas.
 * 3. Validação de falsos positivos para logs de erro (evita auditar o próprio log).
 */
export class AuditExpertEngine {
    private riskTypes: Record<string, string> = {
        "eval": "CRITICAL",
        "exec": "CRITICAL",
        "system": "HIGH",
        "shell": "HIGH",
        "global": "MEDIUM",
        "debug": "LOW",
        "except": "MEDIUM",
        "print": "LOW"
    };

    /**
     * Realiza a varredura de um padrão no conteúdo (AuditScannerEngine.scan_pattern logic).
     */
    public scanPattern(
        pattern: { regex: string; issue: string; severity?: string },
        lines: string[],
        file: string,
        agentName: string,
        auditor: any, // StructuralAuditorSupreme
        veto: any     // Veto engine
    ): AuditEntry[] {
        const issues: AuditEntry[] = [];
        const regex = new RegExp(pattern.regex, "i");

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (line === undefined) continue;

            // Integração com motor de veto (LineVeto logic)
            if (veto && veto.shouldSkip && veto.shouldSkip(line, pattern, { file, agentName })) continue;

            // Busca de padrão (Regex scan)
            if (!regex.test(line)) continue;

            // Prevenção de circularidade (isErrorReport logic)
            if (this.isErrorReport(lines, i)) continue;

            // Validação de risco AST (StructuralAuditor integration)
            let severity = pattern.severity || "MEDIUM";
            if (auditor && auditor.isInteractionSafe) {
                const riskType = this.mapRiskLevel(pattern.regex);
                const safety = auditor.isInteractionSafe(lines.join("\n"), i + 1, riskType);
                if (safety && safety.isSafe) continue; // Risco mitigado ou falso positivo
                if (safety && safety.reason && safety.reason.includes("Severity:")) {
                    severity = safety.reason.split("Severity:")[1].split("]")[0].trim();
                }
            }

            issues.push(this.createEntry(file, i, pattern, lines, agentName, severity));
        }

        return issues;
    }

    /**
     * Cria uma entrada de auditoria formatada (Fidelity+: Snippet inteligente).
     */
    public createEntry(
        file: string,
        lineIdx: number,
        pattern: { regex: string; issue: string; severity?: string },
        lines: string[],
        agentName: string,
        severityOverride?: string
    ): AuditEntry {
        // Snippet inteligente: Janela dinâmica baseada no conteúdo
        let start = Math.max(0, lineIdx - 2);
        let end = Math.min(lines.length, lineIdx + 3);

        // Se houver try/catch ou if por perto, expande a janela para contexto
        if (lines[lineIdx] && (lines[lineIdx].includes("if") || lines[lineIdx].includes("try"))) {
            start = Math.max(0, lineIdx - 5);
            end = Math.min(lines.length, lineIdx + 6);
        }

        const severity = (severityOverride || pattern.severity || "MEDIUM").toUpperCase();

        return {
            file,
            line: lineIdx + 1,
            issue: pattern.issue,
            severity,
            context: agentName,
            snippet: lines.slice(start, end).join("\n")
        };
    }

    /**
     * Mapeia o tipo de risco baseado no padrão detectado (Fidelity+: Mapeamento granular).
     */
    public mapRiskLevel(patternRegex: string | RegExp): string {
        const lower = String(patternRegex).toLowerCase();
        if (lower.includes("eval") || lower.includes("exec")) return "CRITICAL";
        if (lower.includes("shell") || lower.includes("system") || lower.includes("spawn")) return "HIGH";
        if (lower.includes("global") || lower.includes("except") || lower.includes("catch")) return "MEDIUM";
        if (lower.includes("debug") || lower.includes("print") || lower.includes("log")) return "LOW";
        return "MEDIUM";
    }

    /**
     * Verifica se a linha é apenas um relatório de log, para evitar circularidade.
     */
    public isErrorReport(lines: string[], idx: number): boolean {
        const current = lines[idx] || "";
        const next = lines[idx + 1] || "";
        const combined = (current + next).toLowerCase();
        return combined.includes("logger.error") || combined.includes("logger.exception") || combined.includes("console.error");
    }

    /** Parity: _validate_risk_level — Validates a risk level string. */
    public _validate_risk_level(level: string): string {
        const valid = ["CRITICAL", "HIGH", "MEDIUM", "LOW", "STRATEGIC"];
        const upper = (level || "MEDIUM").toUpperCase();
        return valid.includes(upper) ? upper : "MEDIUM";
    }

    /** Parity: _parse_severity — Parses severity from pattern metadata. */
    public _parse_severity(pattern: { severity?: string }): string {
        return this._validate_risk_level(pattern.severity || "MEDIUM");
    }
}

/** Parity: AuditScannerEngine — Legacy alias for AuditExpertEngine. */
export class AuditScannerEngine extends AuditExpertEngine { }

/** Parity: AuditRiskEngine — Legacy alias for AuditExpertEngine. */
export class AuditRiskEngine extends AuditExpertEngine { }

/** Parity: map_risk_type — Stub for legacy risk mapping. */
export function map_risk_type(risk: string): string {
    return risk.toUpperCase();
}
