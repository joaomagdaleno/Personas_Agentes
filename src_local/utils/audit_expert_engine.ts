import winston from "winston";

const logger = winston.child({ module: "AuditExpertEngine" });

export interface AuditEntry {
    file: string; line: number; issue: string; severity: string; context: string; snippet: string;
}

/**
 * 🔎 Audit Expert Engine — PhD in High-Fidelity Auditing.
 */
export class AuditExpertEngine {
    private readonly RISK_MAP: Record<string, string> = {
        "eval": "CRITICAL", "exec": "CRITICAL", "system": "HIGH", "shell": "HIGH", "spawn": "HIGH",
        "global": "MEDIUM", "except": "MEDIUM", "catch": "MEDIUM", "debug": "LOW", "print": "LOW", "log": "LOW"
    };

    public scanPattern(pattern: any, lines: string[], file: string, agentName: string, auditor: any, veto: any): AuditEntry[] {
        const regex = new RegExp(pattern.regex, "i");
        return lines.reduce((acc: AuditEntry[], line, i) => {
            if (!line || (veto?.shouldSkip?.(line, pattern, { file, agentName })) || !regex.test(line) || this.isErrorReport(lines, i)) return acc;

            let severity = (pattern.severity || "MEDIUM").toUpperCase();
            if (auditor?.isInteractionSafe) {
                const safety = auditor.isInteractionSafe(lines.join("\n"), i + 1, this.mapRiskLevel(pattern.regex));
                if (safety?.isSafe) return acc;
                if (safety?.reason?.includes("Severity:")) severity = safety.reason.split("Severity:")[1].split("]")[0].trim().toUpperCase();
            }
            acc.push(this.createEntry(file, i, pattern, lines, agentName, severity));
            return acc;
        }, []);
    }

    public createEntry(file: string, lineIdx: number, pattern: any, lines: string[], agentName: string, severityOverride?: string): AuditEntry {
        const isComplex = lines[lineIdx]?.match(/if|try/);
        const windowSize = isComplex ? 5 : 2;
        const start = Math.max(0, lineIdx - windowSize), end = Math.min(lines.length, lineIdx + windowSize + 1);
        return {
            file, line: lineIdx + 1, issue: pattern.issue, severity: (severityOverride || pattern.severity || "MEDIUM").toUpperCase(),
            context: agentName, snippet: lines.slice(start, end).join("\n")
        };
    }

    public mapRiskLevel(patternRegex: string | RegExp): string {
        const lower = String(patternRegex).toLowerCase();
        return Object.entries(this.RISK_MAP).find(([kw]) => lower.includes(kw))?.[1] || "MEDIUM";
    }

    public isErrorReport(lines: string[], idx: number): boolean {
        const combined = ((lines[idx] || "") + (lines[idx + 1] || "")).toLowerCase();
        return /logger\.error|logger\.exception|console\.error/.test(combined);
    }

    public _validate_risk_level(level: string): string {
        const valid = ["CRITICAL", "HIGH", "MEDIUM", "LOW", "STRATEGIC"];
        const upper = (level || "MEDIUM").toUpperCase();
        return valid.includes(upper) ? upper : "MEDIUM";
    }

    public _parse_severity(pattern: any): string { return this._validate_risk_level(pattern.severity || "MEDIUM"); }
}

export class AuditScannerEngine extends AuditExpertEngine { }
export class AuditRiskEngine extends AuditExpertEngine { }
export function map_risk_type(risk: string): string { return risk.toUpperCase(); }
