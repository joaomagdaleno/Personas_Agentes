import fs from "node:fs";

const report = fs.readFileSync("docs/auto_healing_VERIFIED.md", "utf-8");
const lines = report.split("\n");

interface GapDetail {
    file: string;
    level: string;
    missing_count: number;
    missing_units: string[];
}

const allGaps: GapDetail[] = [];
let lastLocal = "";
let lastLevel = "";
let lastMissingCount = 0;
let collectingMissing = false;
let currentMissing: string[] = [];

for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? "";

    if (line.includes("**Local:**")) {
        // If we were collecting missing, flush
        if (collectingMissing && lastLocal && lastLevel) {
            allGaps.push({ file: lastLocal, level: lastLevel, missing_count: lastMissingCount, missing_units: [...currentMissing] });
        }
        lastLocal = line.replace(/.*`([^`]+)`.*/s, "$1").trim();
        lastLevel = "";
        lastMissingCount = 0;
        collectingMissing = false;
        currentMissing = [];
    }

    if (line.includes("PARITY_GAPS") && line.includes("Faltam")) {
        const match = line.match(/Faltam (\d+)/);
        lastLevel = "GAP";
        lastMissingCount = parseInt(match?.[1] || "0");
    }

    if (line.includes("SHALLOW") && line.includes("Faltam")) {
        const match = line.match(/Faltam (\d+)/);
        lastLevel = "SHALLOW";
        lastMissingCount = parseInt(match?.[1] || "0");
    }

    if (line.includes("Ausentes")) {
        collectingMissing = true;
        continue;
    }

    if (collectingMissing && line.trim().startsWith(">") && line.includes("- `")) {
        const unit = line.replace(/.*`([^`]+)`.*/s, "$1").trim();
        currentMissing.push(unit);
    }

    if (collectingMissing && !line.trim().startsWith(">")) {
        if (lastLevel === "GAP") {
            allGaps.push({ file: lastLocal, level: lastLevel, missing_count: lastMissingCount, missing_units: [...currentMissing] });
        }
        collectingMissing = false;
        currentMissing = [];
    }
}

// Flush last
if (collectingMissing && lastLevel === "GAP") {
    allGaps.push({ file: lastLocal, level: lastLevel, missing_count: lastMissingCount, missing_units: [...currentMissing] });
}

let output = `DETAILED GAP ANALYSIS (${allGaps.length} gaps)\n${"=".repeat(50)}\n\n`;

for (const gap of allGaps) {
    output += `📁 ${gap.file}\n   Missing (${gap.missing_count}): ${gap.missing_units.join(", ")}\n\n`;
}

// Categorize
const initGaps = allGaps.filter(g => g.missing_units.includes("__init__"));
const otherGaps = allGaps.filter(g => !g.missing_units.includes("__init__"));

output += `\n${"=".repeat(50)}\nCATEGORIES:\n`;
output += `  __init__ only: ${initGaps.length}\n`;
output += `  Real logic gaps: ${otherGaps.length}\n`;

fs.writeFileSync("gap_analysis_detailed.txt", output);
console.log("Written to gap_analysis_detailed.txt");
