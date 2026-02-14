import winston from "winston";

const logger = winston.child({ module: "PersonaLoader" });

export class PersonaLoader {
    static async mobilizeAll(projectRoot: string, orchestrator: any) {
        logger.info("🎭 [Loader] Iniciando mobilização em massa de PhDs (Bun)...");
        const loader = new PersonaLoader();
        await loader.loadPersonas(orchestrator);
    }

    async loadPersonas(orchestrator: any) {
        try {
            const manifestPath = path.join(__dirname, "persona_manifest.json");
            const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));

            logger.info(`🎭 [Loader] Carregando ${manifest.personas.length} PhDs do manifesto...`);

            const { DynamicPersona } = await import("../agents/dynamic_persona.ts");
            const { TestifyPersona } = await import("../agents/Support/testify_persona.ts");

            for (const metadata of manifest.personas) {
                let persona;
                if (metadata.name === "Testify") {
                    persona = new TestifyPersona(orchestrator.projectRoot.toString());
                } else {
                    persona = new DynamicPersona(metadata, orchestrator.projectRoot.toString());
                }
                orchestrator.addPersona(persona);
            }

            logger.info("🎭 [Loader] Mobilização em massa concluída.");
        } catch (e) {
            logger.error(`❌ [Loader] Falha ao carregar manifesto de personas: ${e}`);

            // Fallback for critical ones if manifest fails
            orchestrator.addPersona({ name: "Director", role: "Strategic Lead" });
        }
    }
}

import * as fs from 'fs';
import * as path from 'path';
