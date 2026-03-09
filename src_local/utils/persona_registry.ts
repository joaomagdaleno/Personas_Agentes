import winston from "winston";
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

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
            const manifest = this.loadManifest();
            logger.info(`🎭 [Registry] Analisando memórias de ${manifest.personas.length} PhDs...`);

            for (const metadata of manifest.personas) {
                const persona = await this.mobilizePersona(metadata);
                orchestrator.addPersona(persona);
            }

            logger.info("🎭 [Registry] Frota mobilizada com sucesso.");
        } catch (e) {
            logger.error(`❌ [Registry] Falha crítica na mobilização da frota: ${e}`);
        }
    }

    private loadManifest(): any {
        const manifestPath = path.join(__dirname, "persona_manifest.json");
        if (!fs.existsSync(manifestPath)) {
            logger.warn(`⚠️ [Registry] Manifesto não encontrado em ${manifestPath}. Tentando gerar on-demand...`);
            const scriptPath = path.join(__dirname, "..", "..", "scripts", "extract_personas.ts");
            const res = spawnSync("bun", ["run", scriptPath], { stdio: "inherit" });
            if (res.status !== 0) {
                throw new Error(`Falha ao gerar o manifesto de personas (exit_code: ${res.status}).`);
            }
            if (!fs.existsSync(manifestPath)) {
                throw new Error(`Manifesto gerado não foi encontrado em ${manifestPath}`);
            }
        }
        return JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
    }

    private async mobilizePersona(metadata: any): Promise<any> {
        let persona = await this.tryLoadDetailedPersona(metadata);
        if (!persona) {
            persona = await this.loadFallbackPersona(metadata);
        }
        return persona;
    }

    private async tryLoadDetailedPersona(metadata: any): Promise<any | null> {
        const detailedPath = this.resolveDetailedPath(metadata);
        if (!detailedPath || !fs.existsSync(detailedPath)) return null;

        try {
            const module = await import(detailedPath);
            const PersonaClass = Object.values(module).find((v: any) =>
                typeof v === 'function' && v.name?.endsWith('Persona')
            ) as any;

            if (PersonaClass) {
                logger.debug(`💎 [Registry] PhD Detalhado carregado: ${metadata.name}`);
                return new PersonaClass(this.projectRoot);
            }
        } catch (err: any) {
            logger.warn(`⚠️ [Registry] Falha ao importar PhD detalhado ${metadata.name}: ${err.message}`);
        }
        return null;
    }

    private async loadFallbackPersona(metadata: any): Promise<any> {
        if (metadata.name === "Testify") {
            const { TestifyPersona } = await import("../agents/Support/Automation/testify_persona.ts");
            return new TestifyPersona(this.projectRoot);
        }
        const { SchemaPersona } = await import("../agents/schema_persona.ts");
        return new SchemaPersona(metadata, this.projectRoot);
    }

    /**
     * Resolve o caminho do arquivo .ts detalhado baseado nos metadados do manifesto.
     */
    private resolveDetailedPath(metadata: any): string | null {
        if (!["TypeScript", "Bun", "Go", "Kotlin"].includes(metadata.stack)) return null;

        if (metadata.originalFile && metadata.originalFile.endsWith('.ts')) {
            return path.resolve(this.projectRoot, metadata.originalFile);
        }

        // Fallback: Tentar reconstruir o path baseado na categoria e nome
        const relativePath = path.join(__dirname, "..", "agents", metadata.stack, metadata.category, `${metadata.name.toLowerCase()}.ts`);
        return relativePath;
    }
}
