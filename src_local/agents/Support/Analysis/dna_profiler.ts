import { Path } from "../../../core/path_utils.ts";
import winston from "winston";
import { HubManagerGRPC } from "../../../core/hub_manager_grpc.ts";

const logger = winston.child({ module: "DNAProfiler" });

/**
 * 🧬 Perfilador de DNA PhD (gRPC Proxy).
 */
export class DNAProfiler {
    constructor(private hubManager?: HubManagerGRPC) { }

    async discoverIdentity(projectRoot: Path): Promise<any> {
        console.log(`🧬 [DNAProfiler] Investigando identidade em: ${projectRoot.toString()}`);

        if (this.hubManager) {
            try {
                const identity = await this.hubManager.discoverIdentity(projectRoot.toString());
                if (identity) {
                    // Convert back to compatible format (Set for stacks)
                    return {
                        stacks: new Set(identity.stacks),
                        type: identity.project_type,
                        coreMission: identity.core_mission,
                        isExternal: identity.is_external,
                        frameworks: identity.frameworks
                    };
                }
            } catch (err) {
                logger.warn("gRPC DNA profiling failed, falling back to TypeScript", { error: err });
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
