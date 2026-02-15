import winston from "winston";
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const logger = winston.child({ module: "PersonaRegistry" });

/**
 * 🗺️ PersonaRegistry — PhD in Agent Topology & Fleet Mobilization
 * Assistente Técnico: Cartógrafo de Personas e Stacks.
 * Responsável por carregar agentes detalhados (.ts) ou fallbacks (SchemaPersona).
 */
export class PersonaRegistry {
    private projectRoot: string;

    constructor(projectRoot: string) {
        this.projectRoot = projectRoot;
    }

    /**
     * Mobiliza a frota de PhDs de forma inteligente.
     */
    static async mobilizeAll(projectRoot: string, orchestrator: any) {
        logger.info("🎭 [Registry] Iniciando mobilização inteligente de PhDs...");
        const registry = new PersonaRegistry(projectRoot);
        await registry.loadFleet(orchestrator);
    }

    async loadFleet(orchestrator: any) {
        try {
            const manifestPath = path.join(__dirname, "..", "utils", "persona_manifest.json");
            if (!fs.existsSync(manifestPath)) {
                throw new Error(`Manifesto não encontrado: ${manifestPath}`);
            }

            const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
            logger.info(`🎭 [Registry] Analisando memórias de ${manifest.personas.length} PhDs...`);

            const { SchemaPersona } = await import("../agents/schema_persona.ts");
            const { TestifyPersona } = await import("../agents/Support/testify_persona.ts");

            for (const metadata of manifest.personas) {
                let persona;

                // 1. Tentar Importar Classe Detalhada (PhD Real)
                const detailedPath = this.resolveDetailedPath(metadata);

                if (detailedPath && fs.existsSync(detailedPath)) {
                    try {
                        const module = await import(detailedPath);
                        // Procurar por classes que terminam em Persona (ex: MacroPersona)
                        const PersonaClass = Object.values(module).find((v: any) =>
                            typeof v === 'function' && v.name?.endsWith('Persona')
                        ) as any;

                        if (PersonaClass) {
                            persona = new PersonaClass(this.projectRoot);
                            logger.debug(`💎 [Registry] PhD Detalhado carregado: ${metadata.name}`);
                        }
                    } catch (importErr) {
                        logger.warn(`⚠️ [Registry] Falha ao importar PhD detalhado ${metadata.name}, usando Schema fallback.`);
                    }
                }

                // 2. Fallbacks e Exceções
                if (!persona) {
                    if (metadata.name === "Testify") {
                        persona = new TestifyPersona(this.projectRoot);
                    } else {
                        // O "Ator de Script" genérico
                        persona = new SchemaPersona(metadata, this.projectRoot);
                    }
                }

                orchestrator.addPersona(persona);
            }

            logger.info("🎭 [Registry] Frota mobilizada com sucesso.");
        } catch (e) {
            logger.error(`❌ [Registry] Falha crítica na mobilização da frota: ${e}`);
        }
    }

    /**
     * Resolve o caminho do arquivo .ts detalhado baseado nos metadados do manifesto.
     */
    private resolveDetailedPath(metadata: any): string | null {
        if (!["TypeScript", "Bun"].includes(metadata.stack)) return null;

        // Tentar reconstruir o path baseado na categoria e nome
        // Ex: TypeScript/Audit/bolt.ts
        const relativePath = path.join(__dirname, "..", "agents", metadata.stack, metadata.category, `${metadata.name}.ts`);
        return relativePath;
    }
}
