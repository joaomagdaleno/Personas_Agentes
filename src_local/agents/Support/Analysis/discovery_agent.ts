import winston from "winston";
import { GoDiscoveryAdapter } from "../../../utils/go_discovery_adapter.ts";
import { Path } from "../../../core/path_utils.ts";
import { DepthIntelligence } from "../../../utils/depth_intelligence.ts";
import * as fs from "node:fs";
import * as path from "node:path";

const logger = winston.child({ module: "DiscoveryAgent" });

export class DiscoveryAgent {
    orc: any;

    constructor(orchestrator: any) {
        this.orc = orchestrator;
    }

    async runDiscoveryPhase(): Promise<[any, any[]]> {
        logger.info("🔭 Iniciando fase de descoberta (Híbrida: Go + TS + Depth Audit)...");

        const projectRoot = this.orc.projectRoot.toString();
        const legacyRoot = "C:/Users/joaom/Documents/GitHub/legacy_restore"; // Scan entire legacy repository
        const currentRoot = projectRoot; // Scan entire current repository

        // 1. Scan Atômico Dual (Legacy vs Current) com Força Bruta Go
        const legacyFiles = GoDiscoveryAdapter.scan(legacyRoot, legacyRoot, true);
        const currentFiles = GoDiscoveryAdapter.scan(currentRoot, currentRoot, false);

        const findings: any[] = [];

        // Detectar Disparidades Atômicas (Candidatos para Auto-Cura)
        for (const legFile of legacyFiles) {
            const curFile = currentFiles.find(f => f.path === legFile.path);
            if (!curFile) {
                findings.push({
                    type: "DISPARITY",
                    severity: "CRITICAL",
                    file: `src_local/${legFile.path}`,
                    issue: `Arquivo ${legFile.path} existe no legado mas está AUSENTE no atual.`,
                    category: "Structural"
                });
                continue;
            }

            for (const legUnit of legFile.units) {
                const hasUnit = curFile.units.some(u => u.name === legUnit.name && u.type === legUnit.type);
                if (!hasUnit) {
                    findings.push({
                        type: "DISPARITY",
                        severity: "HIGH",
                        file: `src_local/${legFile.path}`,
                        issue: `A lógica '${legUnit.name}' (${legUnit.type}) do legado (L${legUnit.line}) não foi migrada.`,
                        category: "AtomicParity",
                        meta: { unit: legUnit, legacyPath: "C:/Users/joaom/Documents/GitHub/legacy_restore/src_local/" + legFile.path }
                    });
                }
            }
        }

        // 2. Análise de Profundidade (Inteligência Superior)
        logger.info("🧠 Executando Auditoria de Profundidade e Soberania...");
        console.log(`🔍 [Discovery] Verificando arquivos TS em ${currentRoot}...`);
        const tsFiles = this.recursiveReaddir(currentRoot, [".ts"]);
        console.log(`✅ [Discovery] Encontrados ${tsFiles.length} arquivos TS.`);

        console.log(`🔍 [Discovery] Verificando arquivos PY em ${legacyRoot}...`);
        const pyFiles = this.recursiveReaddir(legacyRoot, [".py"]);
        console.log(`✅ [Discovery] Encontrados ${pyFiles.length} arquivos PY.`);

        const atomicUnits = [...legacyFiles, ...currentFiles];

        logger.info(`🧠 Invocando DepthIntelligence com ${atomicUnits.length} unidades atômicas...`);
        const depthAudit = DepthIntelligence.calculateDepthAudit(projectRoot, tsFiles, pyFiles, atomicUnits);

        // 3. Análise de Contexto Clássica
        const ctx = await this.orc.contextEngine.analyzeProject();
        ctx.atomicUnits = currentFiles;
        ctx.depthAudit = depthAudit; // Injetando auditoria de profundidade no contexto

        const auditFindings = await this.orc.runStrategicAudit(ctx, null, false);
        const obfuscationFindings = await this.orc.runObfuscationScan();

        findings.push(...auditFindings, ...obfuscationFindings);

        return [ctx, findings];
    }

    private recursiveReaddir(dir: string, exts: string[]): string[] {
        let results: string[] = [];
        // logger.debug(`📂 Lendo diretório: ${dir}`);
        if (!fs.existsSync(dir)) {
            logger.warn(`⚠️ Diretório não encontrado: ${dir}`);
            return results;
        }
        try {
            const list = fs.readdirSync(dir, { withFileTypes: true });
            for (const item of list) {
                const fullPath = path.join(dir, item.name);
                if (item.isDirectory()) {
                    if (["node_modules", ".git", ".gemini", "dist", "artifacts"].includes(item.name)) continue;
                    results = results.concat(this.recursiveReaddir(fullPath, exts));
                } else if (exts.includes(path.extname(item.name))) {
                    results.push(fullPath);
                }
            }
        } catch (e) {
            logger.warn(`⚠️ Erro ao ler diretório ${dir}: ${e}`);
        }
        return results;
    }
}
