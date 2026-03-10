/**
 * Script to auto-generate an enriched agents_registry.json
 * by scanning the agent directories and extracting metadata.
 */
import * as fs from "fs";
import * as path from "path";

const projectRoot = process.cwd();
const agentsDir = path.join(projectRoot, "src_local", "agents");
const LANGUAGES = ["Flutter", "Kotlin", "Python", "TypeScript", "Go", "Bun", "Rust"];
const CATEGORIES = ["Audit", "Content", "Strategic", "System"];

const CAPABILITY_MAP: Record<string, string[]> = {
    Audit: ["performAudit", "regexAnalysis", "codeSmellDetection"],
    Content: ["contentGeneration", "templateReasoning", "documentationAnalysis"],
    Strategic: ["strategicReasoning", "objectiveAlignment", "riskAssessment"],
    System: ["systemMonitoring", "infrastructureAnalysis", "performanceInsight"],
};

const DEPENDENCY_MAP: Record<string, string[]> = {
    bolt: [], metric: ["bolt"], nebula: [], probe: [], scale: ["metric"],
    scope: ["probe"], testify: ["probe", "scope"], echo: [], forge: ["echo"],
    globe: [], hype: [], mantra: [], palette: [], scribe: ["echo"],
    sentinel: ["bolt", "metric"], vault: [], voyager: ["sentinel"],
    warden: ["vault"], bridge: [], hermes: [], neural: [], spark: [],
    stream: [], cache: [], nexus: ["bridge"], flow: ["stream"],
    core: [], clock: [], vortex: [], director: ["sentinel"],
};

interface AgentEntry {
    name: string;
    version: string;
    status: string;
    category: string;
    capabilities: string[];
    dependencies: string[];
    updatedAt: string;
}

const result: Record<string, any> = {
    "$schema": "agents_registry/v2",
    last_sync: Date.now() / 1000,
    stacks: {} as Record<string, AgentEntry[]>,
};

for (const lang of LANGUAGES) {
    const langDir = path.join(agentsDir, lang);
    if (!fs.existsSync(langDir)) continue;

    const agents: AgentEntry[] = [];

    for (const cat of CATEGORIES) {
        const catDir = path.join(langDir, cat);
        if (!fs.existsSync(catDir)) continue;

        const files = fs.readdirSync(catDir).filter(
            (f: string) => f.endsWith(".ts") && !f.endsWith(".test.ts") && !f.startsWith("_")
        );

        for (const file of files) {
            const name = file.replace(".ts", "");
            const stat = fs.statSync(path.join(catDir, file));

            agents.push({
                name,
                version: "1.0.0",
                status: "STABLE",
                category: cat,
                capabilities: CAPABILITY_MAP[cat] || [],
                dependencies: DEPENDENCY_MAP[name] || [],
                updatedAt: stat.mtime.toISOString(),
            });
        }
    }

    if (agents.length > 0) {
        result.stacks[lang] = agents;
    }
}

const output = JSON.stringify(result, null, 4);
fs.writeFileSync(path.join(projectRoot, "agents_registry.json"), output);

const totalAgents = Object.values(result.stacks as Record<string, AgentEntry[]>).flat().length;
console.log(`✅ Registry generated: ${totalAgents} agents across ${Object.keys(result.stacks).length} stacks`);
