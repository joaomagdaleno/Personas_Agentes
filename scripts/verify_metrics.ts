import { SourceCodeParser } from "../src_local/agents/Support/Analysis/source_code_parser.ts";
import { ComponentClassifier } from "../src_local/agents/Support/Analysis/component_classifier.ts";
import * as fs from "node:fs";

const classifier = new ComponentClassifier();
const parser = new SourceCodeParser();

const files = [
    "src_local/interface/views/dashboard_view.py",
    "scripts/launch_dashboard.py",
    "src_local/agents/Support/Security/safety_definitions.ts"
];

const logFile = "complexity_report.txt";
fs.writeFileSync(logFile, "");

for (const file of files) {
    const relPath = file.replace(/\//g, "\\");
    const content = fs.readFileSync(file, "utf-8");
    const type = classifier.mapType(relPath);
    let complexity = 0;
    if (file.endsWith(".py")) {
        complexity = parser.calculatePyComplexity(content);
    } else {
        complexity = parser.calculateTsComplexity(content);
    }
    const log = `FILE: ${file}\n  TYPE: ${type}\n  COMPLEXITY: ${complexity}\n\n`;
    fs.appendFileSync(logFile, log);
}
