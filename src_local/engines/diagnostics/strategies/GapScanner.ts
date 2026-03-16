import fs from "node:fs";

import { GapExtractor } from "./GapExtractor.ts";

export interface GapDetail {
    file: string;
    level: string;
    missing_count: number;
    missing_units: string[];
}

export class GapScanner {
    static extractFromFile(reportPath: string): GapDetail[] {
        if (!fs.existsSync(reportPath)) return [];
        const report = fs.readFileSync(reportPath, "utf-8");
        return GapExtractor.extract(report);
    }

    static extractFromContent(content: string): GapDetail[] {
        return GapExtractor.extract(content);
    }

    static formatAnalysis(allGaps: GapDetail[]): string {
        let output = `DETAILED GAP ANALYSIS (${allGaps.length} gaps)\n${"=".repeat(50)}\n\n`;
        for (const gap of allGaps) {
            output += `📁 ${gap.file}\n   Missing (${gap.missing_count}): ${gap.missing_units.join(", ")}\n\n`;
        }

        const initGaps = allGaps.filter(g => g.missing_units.includes("__init__"));
        const otherGaps = allGaps.filter(g => !g.missing_units.includes("__init__"));

        output += `\n${"=".repeat(50)}\nCATEGORIES:\n`;
        output += `  __init__ only: ${initGaps.length}\n`;
        output += `  Real logic gaps: ${otherGaps.length}\n`;
        return output;
    }
}
