import winston from "winston";

const logger = winston.child({ module: "FindingDeduplicator" });

/**
 * 🔬 Assistente de Deduplicação Forense (Bun Version).
 */
export class FindingDeduplicator {
    /** Parity: __init__ */
    constructor() {
        // Severity rank is initialized as a class field.
    }

    private severityRank: Record<string, number> = {
        "CRITICAL": 5, "HIGH": 4, "MEDIUM": 3,
        "LOW": 2, "STRATEGIC": 1, "HEALED": 0
    };

    deduplicate(allRawFindings: any[]): any[] {
        const coordinateMap = new Map<string, any>();

        for (const f of allRawFindings) {
            if (typeof f !== 'object' || f === null) {
                this.handleRawText(f, coordinateMap);
                continue;
            }

            this.handleFindingDict(f, coordinateMap);
        }

        return Array.from(coordinateMap.values());
    }

    private handleRawText(f: any, coordinateMap: Map<string, any>) {
        const fHash = Bun.hash(String(f)).toString();
        if (!coordinateMap.has(fHash)) {
            coordinateMap.set(fHash, f);
        }
    }

    private handleFindingDict(f: any, coordinateMap: Map<string, any>) {
        const coord = this.generateCoordinate(f);
        const existing = coordinateMap.get(coord);

        if (!existing) {
            coordinateMap.set(coord, f);
        } else {
            this.resolveSeverityConflict(coord, f, coordinateMap);
        }
    }

    private generateCoordinate(f: any): string {
        const cleanPath = this.normalizePath(f.file || 'global');
        const fIssue = f.issue || 'Unknown Issue';

        if (this.isComplexityHotspot(fIssue)) {
            return `COMPLEXITY:${cleanPath}`;
        }

        return `${cleanPath}:${f.line || 0}:${fIssue}`;
    }

    private isComplexityHotspot(issue: string): boolean {
        return issue.includes("Complexity") || issue.includes("Complexidade");
    }

    private normalizePath(rawPath: string): string {
        return rawPath.replace(/\\/g, "/");
    }

    private resolveSeverityConflict(coord: string, newFinding: any, coordinateMap: Map<string, any>) {
        const existing = coordinateMap.get(coord);
        if (typeof existing !== 'object') return;

        const newSev = (newFinding.severity || 'MEDIUM').toUpperCase();
        const existingSev = (existing.severity || 'MEDIUM').toUpperCase();

        if ((this.severityRank[newSev] || 3) > (this.severityRank[existingSev] || 3)) {
            coordinateMap.set(coord, newFinding);
        }
    }
}
