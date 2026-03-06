import * as cp from "node:child_process";
import * as path from "node:path";
import * as fs from "node:fs";
import { Path } from "../../../core/path_utils.ts";
import winston from "winston";

const logger = winston.child({ module: "DNAProfiler" });

/**
 * 🧬 Perfilador de DNA PhD (Rust-Enhanced).
 */
export class DNAProfiler {
    private static BINARY_PATH = path.resolve(process.cwd(), "src_native/analyzer/target/release/analyzer.exe");

    async discoverIdentity(projectRoot: Path): Promise<any> {
        console.log(`🧬 [DNAProfiler] Investigando identidade em: ${projectRoot.toString()}`);

        if (fs.existsSync(DNAProfiler.BINARY_PATH)) {
            try {
                const output = cp.execSync(`${DNAProfiler.BINARY_PATH} dna ${projectRoot.toString()}`, { encoding: 'utf8' });
                const identity = JSON.parse(output);

                // Convert back to compatible format (Set for stacks)
                return {
                    stacks: new Set(identity.stacks),
                    type: identity.project_type,
                    coreMission: identity.core_mission,
                    isExternal: identity.is_external,
                    frameworks: identity.frameworks
                };
            } catch (err) {
                logger.warn("Rust DNA profiling failed, falling back to TypeScript", { error: err });
            }
        }

        // TS Fallback (Legacy)
        const dna = {
            stacks: new Set<string>(),
            type: "Orquestrador Multi-Agente",
            coreMission: "Orquestração de Inteligência Artificial",
            isExternal: !projectRoot.toString().includes("Personas_Agentes")
        };

        if (await projectRoot.join('pubspec.yaml').exists()) dna.stacks.add("Flutter");
        if (await projectRoot.join('build.gradle').exists() || await projectRoot.join('build.gradle.kts').exists()) dna.stacks.add("Kotlin");
        if (await projectRoot.join('requirements.txt').exists()) dna.stacks.add("Python");

        return dna;
    }
}
