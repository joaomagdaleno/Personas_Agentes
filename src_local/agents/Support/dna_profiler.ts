import { Path } from "../../core/path_utils.ts";

/**
 * 🧬 Perfilador de DNA PhD (Bun Version).
 */
export class DNAProfiler {
    async discoverIdentity(projectRoot: Path): Promise<any> {
        if (!projectRoot) {
            return { stacks: new Set<string>(), type: "Unknown", coreMission: "Software Proposital", isExternal: false };
        }

        const dna = {
            stacks: new Set<string>(),
            type: "Orquestrador Multi-Agente",
            coreMission: "Orquestração de Inteligência Artificial",
            isExternal: !projectRoot.toString().includes("Personas_Agentes")
        };

        if (await projectRoot.join('pubspec.yaml').exists()) dna.stacks.add("Flutter");
        if (await projectRoot.join('build.gradle').exists() || await projectRoot.join('build.gradle.kts').exists()) {
            dna.stacks.add("Kotlin");
        }
        if (await projectRoot.join('requirements.txt').exists()) dna.stacks.add("Python");

        return dna;
    }
}
