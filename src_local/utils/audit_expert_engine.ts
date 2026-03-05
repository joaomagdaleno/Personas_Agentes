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
        return lines
            .map((_, i) => this.processLine(i, lines, pattern, regex, file, agentName, auditor, veto))
            .filter((entry): entry is AuditEntry => entry !== null);
    }

    private processLine(i: number, lines: string[], pattern: any, regex: RegExp, file: string, agentName: string, auditor: any, veto: any): AuditEntry | null {
        const line = lines[i];
        if (!this.isValidLine(line, regex)) return null;
        if (this.shouldSkipByVetoOrReport(line, i, lines, pattern, file, agentName, veto)) return null;

        const severity = this.determineSeverity(lines, i, pattern, auditor);
        return severity ? this.createEntry(file, i, pattern, lines, agentName, severity) : null;
    }

    private isValidLine(line: string, regex: RegExp): boolean {
        return line !== undefined && line !== null && regex.test(line);
    }

    private determineSeverity(lines: string[], i: number, pattern: any, auditor: any): string | null {
        const defaultSeverity = (pattern.severity || "MEDIUM").toUpperCase();
        if (!auditor?.isInteractionSafe) return defaultSeverity;

        return this.consultAuditor(lines, i, pattern, auditor, defaultSeverity);
    }

    private consultAuditor(lines: string[], i: number, pattern: any, auditor: any, defaultSeverity: string): string | null {
        const risk = this.mapRiskLevel(pattern.regex);
        const safety = auditor.isInteractionSafe(lines.join("\n"), i + 1, risk);

        if (safety?.isSafe) return null;
        return this.extractSeverity(safety, defaultSeverity);
    }

    private shouldSkipByVetoOrReport(line: string, i: number, lines: string[], pattern: any, file: string, agentName: string, veto: any): boolean {
        if (veto?.shouldSkip?.(line, pattern, { file, agentName })) return true;
        return this.isErrorReport(lines, i);
    }

    private extractSeverity(safety: any, defaultSeverity: string): string {
        const reason = safety?.reason || "";
        const severityMarker = "Severity:";
        if (!reason.includes(severityMarker)) return defaultSeverity;
        return this.parseSeverityFromReason(reason, severityMarker, defaultSeverity);
    }

    private parseSeverityFromReason(reason: string, marker: string, def: string): string {
        const parts = reason.split(marker);
        const severityPart = parts[1]?.split("]")[0];
        return severityPart ? severityPart.trim().toUpperCase() : def;
    }

    public createEntry(file: string, lineIdx: number, pattern: any, lines: string[], agentName: string, severityOverride?: string): AuditEntry {
        const window = this.getSnippetWindow(lines[lineIdx]);
        const start = Math.max(0, lineIdx - window);
        const end = Math.min(lines.length, lineIdx + window + 1);

        return {
            file,
            line: lineIdx + 1,
            issue: pattern.issue,
            severity: (severityOverride || pattern.severity || "MEDIUM").toUpperCase(),
            context: agentName,
            snippet: lines.slice(start, end).join("\n")
        };
    }

    private getSnippetWindow(line: string): number {
        return line?.match(/if|try/) ? 5 : 2;
    }

    public mapRiskLevel(patternRegex: string | RegExp): string {
        const lower = String(patternRegex).toLowerCase();
        const found = Object.entries(this.RISK_MAP).find(([kw]) => lower.includes(kw));
        return found ? found[1] : "MEDIUM";
    }

    public isErrorReport(lines: string[], idx: number): boolean {
        const currentLine = lines[idx] || "";
        const nextLine = lines[idx + 1] || "";
        const combined = (currentLine + nextLine).toLowerCase();
        return /logger\.error|logger\.exception|console\.error/.test(combined);
    }

    public _validate_risk_level(level: string): string {
        const valid = ["CRITICAL", "HIGH", "MEDIUM", "LOW", "STRATEGIC"];
        const upper = (level || "MEDIUM").toUpperCase();
        return valid.includes(upper) ? upper : "MEDIUM";
    }

    public _parse_severity(pattern: any): string {
        return this._validate_risk_level(pattern.severity || "MEDIUM");
    }
}

export class AuditScannerEngine extends AuditExpertEngine { }
export class AuditRiskEngine extends AuditExpertEngine { }
export function map_risk_type(risk: string): string { return risk.toUpperCase(); }
