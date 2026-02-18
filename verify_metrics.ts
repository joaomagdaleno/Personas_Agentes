import { SourceCodeParser } from "./src_local/agents/Support/Analysis/source_code_parser.ts";
import { ComponentClassifier } from "./src_local/agents/Support/Analysis/component_classifier.ts";
import * as fs from "node:fs";

const classifier = new ComponentClassifier();
const parser = new SourceCodeParser();

const files = [
    "src_local/agents/Support/Analysis/parity_config.ts",
    "src_local/agents/Support/Analysis/parity_config.test.ts",
    "src_local/agents/Support/Analysis/ignore_list.ts",
    "src_local/agents/Support/Analysis/ignore_list.test.ts",
    "src_local/agents/Support/Analysis/debug_engine.ts",
    "src_local/agents/Support/Analysis/debug_engine.test.ts"
];

const mapData: Record<string, any> = {};

for (const file of files) {
    const relPath = file.replace(/\//g, "\\");
    const content = fs.readFileSync(file, "utf-8");
    const info = {
        component_type: classifier.mapType(relPath),
        complexity: file.endsWith(".test.ts") ? 1 : parser.calculateTsComplexity(content),
        test_depth: file.endsWith(".test.ts") ? {
            assertion_count: (content.match(/assert|expect|should/g) || []).length
        } : undefined
    };
    mapData[relPath] = info;
}

function findTestForModule(moduleName: string, mapData: Record<string, any>): any | null {
    const lowerName = moduleName.toLowerCase();
    for (const [file, info] of Object.entries(mapData)) {
        if (info.component_type === "TEST") {
            const lowerFile = file.toLowerCase();
            // console.log(`Checking test file: ${lowerFile} against ${lowerName}`);
            if (lowerFile.includes(lowerName)) {
                return info;
            }
        }
    }
    return null;
}

const sources = [
    "src_local/agents/Support/Analysis/parity_config.ts",
    "src_local/agents/Support/Analysis/ignore_list.ts",
    "src_local/agents/Support/Analysis/debug_engine.ts",
    "scripts/debug_logic.ts" // Adding this one
];

// Mock scripts/debug_logic.ts in mapData
mapData["scripts\\debug_logic.ts"] = {
    component_type: "DOC",
    complexity: 10
};

for (const source of sources) {
    const relPath = source.replace(/\//g, "\\");
    const targetName = source.split(/[\\/]/).pop()?.replace(/\.(ts|py)$/, "") || "";
    const testInfo = findTestForModule(targetName, mapData);
    const assertions = testInfo ? testInfo.test_depth?.assertion_count : 0;
    console.log(`Source: ${source} | Target: ${targetName} | Assertions: ${assertions}`);
    if (!testInfo) console.log(`  - TEST NOT FOUND`);
}
