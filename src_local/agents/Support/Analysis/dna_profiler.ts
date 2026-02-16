import { Path } from "../../../core/path_utils.ts";

/**
 * 🧬 Perfilador de DNA PhD (Bun Version).
 */
export class DNAProfiler {
    async discoverIdentity(projectRoot: Path): Promise<any> {
        console.log(`🧬 [DNAProfiler] Investigando identidade em: ${projectRoot.toString()}`);
        if (!projectRoot) {
            return { stacks: new Set<string>(), type: "Unknown", coreMission: "Software Proposital", isExternal: false };
        }

        const dna = {
            stacks: new Set<string>(),
            type: "Orquestrador Multi-Agente",
            coreMission: "Orquestração de Inteligência Artificial",
            isExternal: !projectRoot.toString().includes("Personas_Agentes")
        };

        if (await projectRoot.join('pubspec.yaml').exists()) {
            console.log("🧬 [DNAProfiler] Detected Flutter");
            dna.stacks.add("Flutter");
        }
        if (await projectRoot.join('build.gradle').exists() || await projectRoot.join('build.gradle.kts').exists()) {
            console.log("🧬 [DNAProfiler] Detected Kotlin");
            dna.stacks.add("Kotlin");
        }
        if (await projectRoot.join('requirements.txt').exists()) {
            console.log("🧬 [DNAProfiler] Detected Python");
            dna.stacks.add("Python");
        }

        console.log(`🧬 [DNAProfiler] Identidade final: ${Array.from(dna.stacks).join(", ")}`);
        return dna;
    }
}
