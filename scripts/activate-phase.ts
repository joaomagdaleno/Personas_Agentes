import { $ } from "bun";
import { join } from "node:path";

/**
 * Port of activate_phase.ps1 to Bun/TypeScript.
 * Usage: bun run activate-phase.ts <Phase> <Platform>
 */

const phases = ["Genesis", "Infra", "Forge", "Orbit", "Full"] as const;
const platforms = ["Flutter", "Kotlin"] as const;

type Phase = (typeof phases)[number];
type Platform = (typeof platforms)[number];

async function main() {
    const args = process.argv.slice(2);
    if (!validateArgs(args)) process.exit(1);

    const [phase, platform] = args as [Phase, Platform];
    const rootDir = process.cwd();
    const output = phase === "Full" ? await getFullOutput(rootDir, platform) : await getPhaseOutput(rootDir, phase, platform);

    await copyToClipboard(output);
    printSuccess(phase, platform);
}

function validateArgs(args: string[]): boolean {
    if (args.length < 2) {
        console.error("Usage: bun run activate-phase.ts <Phase> <Platform>\nPhases: Genesis, Infra, Forge, Orbit, Full\nPlatforms: Flutter, Kotlin");
        return false;
    }
    if (!phases.includes(args[0] as any)) { console.error(`Invalid phase: ${args[0]}`); return false; }
    if (!platforms.includes(args[1] as any)) { console.error(`Invalid platform: ${args[1]}`); return false; }
    return true;
}

async function getFullOutput(rootDir: string, platform: string): Promise<string> {
    const file = join(rootDir, "Personas_Agentes", `todos_agentes_${platform.toLowerCase()}.txt`);
    if (await Bun.file(file).exists()) return Bun.file(file).text();
    console.error(`File not found: ${file}`);
    process.exit(1);
    return "";
}

async function getPhaseOutput(rootDir: string, phase: Phase, platform: string): Promise<string> {
    const personas = getPersonasForPhase(phase);
    const directorContent = await getDirectorContent(rootDir);
    let output = `=== MASTER ORCHESTRATOR ===\n${directorContent}\n\n`;

    for (const p of personas) {
        output += await getPersonaContent(rootDir, p, platform);
    }
    return output;
}

function getPersonasForPhase(phase: Phase): string[] {
    const map: any = {
        Genesis: ["Scope", "Scale", "Scribe"], Infra: ["Nebula", "Sentinel", "Bridge"],
        Forge: ["Flow", "Palette", "Nexus", "Bolt", "Stream", "Cache"],
        Orbit: ["Testify", "Warden", "Hype", "Metric", "Echo", "Vault"]
    };
    return map[phase] || [];
}

async function getDirectorContent(rootDir: string): Promise<string> {
    const file = join(rootDir, "src_local", "agents", "Python", "Strategic", "director.py");
    return (await Bun.file(file).exists()) ? Bun.file(file).text() : "Master Orchestrator - Driving specialized agents.";
}

async function getPersonaContent(rootDir: string, p: string, platform: string): Promise<string> {
    const agentMap: any = {
        Scope: "Audit/scope.py", Scale: "Audit/scale.py", Scribe: "Content/scribe.py",
        Nebula: "Audit/nebula.py", Sentinel: "Strategic/sentinel.py", Bridge: "System/bridge.py",
        Flow: "System/flow.py", Palette: "Content/palette.py", Nexus: "System/nexus.py",
        Bolt: "Audit/bolt.py", Stream: "System/stream.py", Cache: "System/cache.py",
        Testify: "Audit/testify.py", Warden: "Strategic/warden.py", Hype: "Content/hype.py",
        Metric: "Audit/metric.py", Echo: "Content/echo.py", Vault: "Strategic/vault.py"
    };
    const relPath = agentMap[p];
    if (!relPath) return "";
    const filePath = join(rootDir, "src_local", "agents", platform, relPath);
    if (!(await Bun.file(filePath).exists())) {
        console.warn(`⚠️  Persona not found: ${p}`);
        return "";
    }
    return `=== START OF PERSONA: ${p} (${relPath}) ===\n${await Bun.file(filePath).text()}\n\n`;
}

async function copyToClipboard(output: string) {
    const tempFile = join(process.cwd(), ".temp_clipboard.txt");
    await Bun.write(tempFile, output);
    try {
        await $`powershell -Command "Get-Content -Raw .temp_clipboard.txt | Set-Clipboard"`;
    } catch { console.error("Clipboard fail"); }
    finally { if (await Bun.file(tempFile).exists()) await $`rm ${tempFile}`; }
}

function printSuccess(phase: string, platform: string) {
    console.log(`✅ [PHASE: ${phase}] for ${platform} copied!`);
}

main();
