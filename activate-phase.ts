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
    console.log("Script starting...");
    const args = process.argv.slice(2);
    console.log("Args:", args);
    if (args.length < 2) {
        console.error("Usage: bun run activate-phase.ts <Phase> <Platform>");
        console.error(`Phases: ${phases.join(", ")}`);
        console.error(`Platforms: ${platforms.join(", ")}`);
        process.exit(1);
    }

    const phase = args[0] as Phase;
    const platform = args[1] as Platform;

    if (!phases.includes(phase)) {
        console.error(`Invalid phase: ${phase}. Must be one of: ${phases.join(", ")}`);
        process.exit(1);
    }

    if (!platforms.includes(platform)) {
        console.error(`Invalid platform: ${platform}. Must be one of: ${platforms.join(", ")}`);
        process.exit(1);
    }

    const rootDir = process.cwd();
    const baseDir = join(rootDir, platform);

    let output = "";

    // Updated mapping based on current project structure
    const agentMap: Record<string, string> = {
        // Genesis
        "Scope": "Audit/scope.py",
        "Scale": "Audit/scale.py",
        "Scribe": "Content/scribe.py",
        // Infra
        "Nebula": "Audit/nebula.py",
        "Sentinel": "Strategic/sentinel.py",
        "Bridge": "System/bridge.py",
        // Forge
        "Flow": "System/flow.py",
        "Palette": "Content/palette.py",
        "Nexus": "System/nexus.py",
        "Bolt": "Audit/bolt.py",
        "Stream": "System/stream.py",
        "Cache": "System/cache.py",
        // Orbit
        "Testify": "Audit/testify.py",
        "Warden": "Strategic/warden.py",
        "Hype": "Content/hype.py",
        "Metric": "Audit/metric.py",
        "Echo": "Content/echo.py",
        "Vault": "Strategic/vault.py"
    };

    if (phase === "Full") {
        const fullContextFile = join(rootDir, "Personas_Agentes", `todos_agentes_${platform.toLowerCase()}.txt`);
        const file = Bun.file(fullContextFile);
        if (await file.exists()) {
            output = await file.text();
        } else {
            console.error(`File not found: ${fullContextFile}`);
            process.exit(1);
        }
    } else {
        let personas: string[] = [];
        switch (phase) {
            case "Genesis": personas = ["Scope", "Scale", "Scribe"]; break;
            case "Infra": personas = ["Nebula", "Sentinel", "Bridge"]; break;
            case "Forge": personas = ["Flow", "Palette", "Nexus", "Bolt", "Stream", "Cache"]; break;
            case "Orbit": personas = ["Testify", "Warden", "Hype", "Metric", "Echo", "Vault"]; break;
        }

        // Attempt to find Director info in Python
        const directorFile = join(rootDir, "src_local", "agents", "Python", "Strategic", "director.py");
        let directorContent = "Master Orchestrator - Driving specialized agents to project excellence.";
        if (await Bun.file(directorFile).exists()) {
            directorContent = await Bun.file(directorFile).text();
        }

        output = `=== MASTER ORCHESTRATOR ===\n${directorContent}\n\n`;

        for (const p of personas) {
            const relPath = agentMap[p];
            if (relPath) {
                const filePath = join(rootDir, "src_local", "agents", platform, relPath);
                const file = Bun.file(filePath);
                if (await file.exists()) {
                    const content = await file.text();
                    output += `=== START OF PERSONA: ${p} (${relPath}) ===\n${content}\n\n`;
                } else {
                    console.warn(`\x1b[33m⚠️  Warning: Persona file not found for ${p} at ${filePath}\x1b[0m`);
                }
            }
        }
    }

    // Copy to clipboard using PowerShell (cross-platform way for Windows)
    // We use a temp file to avoid command line length limits
    const tempFile = join(rootDir, ".temp_clipboard.txt");
    await Bun.write(tempFile, output);

    try {
        await $`powershell -Command "Get-Content -Raw .temp_clipboard.txt | Set-Clipboard"`;
        console.log(`\x1b[32m✅ [PHASE: ${phase}] for ${platform} copied to your clipboard!\x1b[0m`);
        if (phase !== "Full") {
            let personasList = "";
            switch (phase) {
                case "Genesis": personasList = "Scope, Scale, Scribe"; break;
                case "Infra": personasList = "Nebula, Sentinel, Bridge"; break;
                case "Forge": personasList = "Flow, Palette, Nexus, Bolt, Stream, Cache"; break;
                case "Orbit": personasList = "Testify, Warden, Hype, Metric, Echo, Vault"; break;
            }
            console.log(`\x1b[36mActive Personas: ${personasList}\x1b[0m`);
        }
    } catch (err) {
        console.error("Failed to copy to clipboard:", err);
    } finally {
        // Cleanup
        const f = Bun.file(tempFile);
        if (await f.exists()) {
            await $`rm ${tempFile}`;
        }
    }
}

main();
