import type { GapDetail } from "./GapScanner.ts";

export class GapExtractor {
    static extract(content: string): GapDetail[] {
        const lines = content.split("\n");
        const allGaps: GapDetail[] = [];
        let state = { lastLocal: "", lastLevel: "", lastMissingCount: 0, collectingMissing: false, currentMissing: [] as string[] };

        for (const line of lines) {
            this.processLine(line.trim(), state, allGaps);
        }

        this.flushGaps(state, allGaps);
        return allGaps;
    }

    private static processLine(line: string, state: any, allGaps: GapDetail[]) {
        if (line.includes("**Local:**")) {
            this.handleLocalLine(line, state, allGaps);
            return;
        }

        if (line.includes("Faltam")) {
            this.handleMissingCountLine(line, state);
            return;
        }

        if (line.includes("Ausentes")) {
            state.collectingMissing = true;
            return;
        }

        if (state.collectingMissing) {
            this.handleCollection(line, state, allGaps);
        }
    }

    private static handleLocalLine(line: string, state: any, allGaps: GapDetail[]) {
        this.flushGaps(state, allGaps);
        state.lastLocal = line.replace(/.*`([^`]+)`.*/s, "$1").trim();
        state.lastLevel = "";
        state.lastMissingCount = 0;
        state.collectingMissing = false;
        state.currentMissing = [];
    }

    private static handleMissingCountLine(line: string, state: any) {
        const match = line.match(/Faltam (\d+)/);
        state.lastLevel = line.includes("PARITY_GAPS") ? "GAP" : "SHALLOW";
        state.lastMissingCount = parseInt(match?.[1] || "0");
    }

    private static handleCollection(line: string, state: any, allGaps: GapDetail[]) {
        if (line.startsWith(">") && line.includes("- `")) {
            state.currentMissing.push(line.replace(/.*`([^`]+)`.*/s, "$1").trim());
        } else if (!line.startsWith(">")) {
            this.flushGaps(state, allGaps);
            state.collectingMissing = false;
            state.currentMissing = [];
        }
    }

    private static flushGaps(state: any, allGaps: GapDetail[]) {
        if (state.lastLocal && state.lastLevel === "GAP" && (state.collectingMissing || state.currentMissing.length > 0)) {
            allGaps.push({ file: state.lastLocal, level: state.lastLevel, missing_count: state.lastMissingCount, missing_units: [...state.currentMissing] });
        }
    }
}
