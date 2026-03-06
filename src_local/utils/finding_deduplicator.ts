import winston from "winston";
import * as cp from "node:child_process";
import * as path from "node:path";
import * as fs from "node:fs";

const logger = winston.child({ module: "FindingDeduplicator" });

/**
 * 🔬 Assistente de Deduplicação Forense (Rust-Enhanced).
 */
export class FindingDeduplicator {
    private static BINARY_PATH = path.resolve(process.cwd(), "src_native/analyzer/target/release/analyzer.exe");

    private severityRank: Record<string, number> = {
        "CRITICAL": 5, "HIGH": 4, "MEDIUM": 3,
        "LOW": 2, "STRATEGIC": 1, "HEALED": 0
    };

    deduplicate(allRawFindings: any[]): any[] {
        if (allRawFindings.length > 50 && fs.existsSync(FindingDeduplicator.BINARY_PATH)) {
            try {
                return this.deduplicateWithRust(allRawFindings);
            } catch (err) {
                logger.warn("Rust deduplication failed, falling back to TypeScript", { error: err });
            }
        }

        const coordinateMap = new Map<string, any>();
        allRawFindings.forEach(f => {
            this.processFinding(f, coordinateMap);
        });
        return Array.from(coordinateMap.values());
    }

    private deduplicateWithRust(findings: any[]): any[] {
        const tmpFile = path.join(process.cwd(), `tmp_dedup_${Date.now()}.json`);
        fs.writeFileSync(tmpFile, JSON.stringify(findings));

        try {
            const output = cp.execSync(`${FindingDeduplicator.BINARY_PATH} deduplicate ${tmpFile}`, {
                encoding: 'utf8',
                maxBuffer: 50 * 1024 * 1024
            });
            return JSON.parse(output);
        } finally {
            if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile);
        }
    }

    private processFinding(f: any, coordinateMap: Map<string, any>) {
        if (typeof f !== 'object' || f === null) {
            this.handleRawText(f, coordinateMap);
        } else {
            this.handleFindingDict(f, coordinateMap);
        }
    }

    private handleRawText(f: any, coordinateMap: Map<string, any>) {
        // Bun.hash is only available in Bun runtime. Check if we have it.
        const hash = typeof Bun !== 'undefined' ? Bun.hash(String(f)).toString() : String(f).length.toString();
        if (!coordinateMap.has(hash)) {
            coordinateMap.set(hash, f);
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
        const cleanPath = (f.file || 'global').replace(/\\/g, "/");
        const fIssue = f.issue || 'Unknown Issue';

        if (fIssue.includes("Complexity") || fIssue.includes("Complexidade")) {
            return `COMPLEXITY:${cleanPath}`;
        }

        return `${cleanPath}:${f.line || 0}:${fIssue}`;
    }

    private resolveSeverityConflict(coord: string, newFinding: any, coordinateMap: Map<string, any>) {
        const existing = coordinateMap.get(coord);
        if (typeof existing !== 'object' || existing === null) return;

        const newWeight = this.getSeverityWeight(newFinding.severity);
        const existingWeight = this.getSeverityWeight(existing.severity);

        if (newWeight > existingWeight) {
            coordinateMap.set(coord, newFinding);
        }
    }

    private getSeverityWeight(severity: string): number {
        const upper = (severity || 'MEDIUM').toUpperCase();
        return this.severityRank[upper] || 3;
    }
}
