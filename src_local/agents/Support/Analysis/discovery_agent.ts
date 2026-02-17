import winston from "winston";
import { GoDiscoveryAdapter } from "../../../utils/go_discovery_adapter.ts";
import type { FileAnalysis } from "../../../utils/go_discovery_adapter.ts";
import { Path } from "../../../core/path_utils.ts";
import { DepthIntelligence } from "../../../utils/depth_intelligence.ts";
import * as fs from "node:fs";
import * as path from "node:path";
import { LEGACY_ALIASES, FILE_MAPPINGS, IGNORE_LIST } from "./parity_config";

import { SourceCodeParser } from "./source_code_parser.ts";

const logger = winston.child({ module: "DiscoveryAgent" });

export class DiscoveryAgent {
    orc: any;
    parser: SourceCodeParser;

    constructor(orchestrator: any) {
        this.orc = orchestrator;
        this.parser = new SourceCodeParser();
    }

    async runDiscoveryPhase(): Promise<[any, any[]]> {
        logger.info("🔭 Iniciando fase de descoberta (Híbrida: Go + TS + Depth Audit)...");

        const projectRoot = this.orc.projectRoot.toString();
        const legacyRoot = "C:/Users/joaom/Documents/GitHub/legacy_restore"; // Scan entire legacy repository
        const currentRoot = projectRoot; // Scan entire current repository

        // 1. Scan Atômico Dual (Legacy vs Current) 
        // v7.3: Use local SourceCodeParser for deep atomic resolution
        const legacyFilesRaw = GoDiscoveryAdapter.scan(legacyRoot, legacyRoot, true);
        const currentFilesRaw = GoDiscoveryAdapter.scan(currentRoot, currentRoot, false);

        // Enrichment Phase: Ensure classes are present (Go scanner blind spot fix)
        const currentFiles = await Promise.all(currentFilesRaw.map(async f => {
            if (f.path.endsWith(".ts") || f.path.endsWith(".tsx")) {
                try {
                    const content = await fs.promises.readFile(path.join(currentRoot, f.path), "utf-8");
                    const analysis = this.parser.analyzeTs(content);
                    return {
                        ...f,
                        units: [
                            ...analysis.classes.map(c => ({ name: c, type: "class" as const, line: 1 })),
                            ...analysis.functions.map(fn => ({ name: fn, type: "function" as const, line: 1 }))
                        ]
                    };
                } catch (err) {
                    return f;
                }
            }
            return f;
        }));

        const legacyFiles = await Promise.all(legacyFilesRaw.map(async f => {
            if (f.path.endsWith(".py")) {
                try {
                    const content = await fs.promises.readFile(path.join(legacyRoot, f.path), "utf-8");
                    const analysis = this.parser.analyzePy(content);
                    return {
                        ...f,
                        units: [
                            ...analysis.classes.map(c => ({ name: c, type: "class" as const, line: 1 })),
                            ...analysis.functions.map(fn => ({ name: fn, type: "function" as const, line: 1 }))
                        ]
                    };
                } catch (err) {
                    return f;
                }
            }
            return f;
        }));

        const findings: any[] = [];
        const mappedSovereign = new Set<string>();

        // Mapeamento Inteligente de Disparidades
        for (const legFile of legacyFiles) {
            let legPath = legFile.path.replace(/\\/g, "/");

            // Conhecimento: Normalizar paths redundantes de forma agressiva (ex: src_local/src_local/...)
            const redundantPrefixes = ["src_local/", "src/", "./"];
            let pathChanged = true;
            while (pathChanged) {
                pathChanged = false;
                for (const prefix of redundantPrefixes) {
                    if (legPath.startsWith(prefix)) {
                        const subPath = legPath.substring(prefix.length);
                        // Verifica se removendo o prefixo o path faz mais sentido ou existe
                        if (currentFiles.some(f => f.path === subPath || f.path.endsWith(subPath))) {
                            legPath = subPath;
                            pathChanged = true;
                        }
                    }
                }
            }

            const fileName = path.basename(legPath);
            if (IGNORE_LIST.includes(fileName) || IGNORE_LIST.includes(legPath) || fileName.startsWith("__")) continue;

            const normName = fileName.replace(/\.py$/, "").replace(/_?persona$/, "").replace(/_?agent$/, "");
            const targetName = LEGACY_ALIASES[normName] || normName;

            // Tentar encontrar match por nome normalizado ou mapeamento explícito
            const isTest = fileName.startsWith("test_");
            let curFile = currentFiles.find(f => {
                const curBase = path.basename(f.path).replace(/\.ts$/, "").toLowerCase();
                const curBaseTest = curBase.replace(/\.test$/, "");

                if (isTest) {
                    const legacyTestBase = fileName.replace(/^test_/, "").replace(/\.py$/, "").toLowerCase();
                    return curBaseTest === legacyTestBase || curBase === fileName.replace(/\.py$/, "").toLowerCase();
                }

                // Match exato de path relativo (pós-normalização)
                if (f.path === legPath || f.path === legPath.replace(/\.py$/, ".ts")) return true;

                return curBase === targetName.toLowerCase() || curBase === normName.toLowerCase();
            });

            // Conhecimento Global: Se não achou por path, procurar por nome em QUALQUER diretório (Migração Estrutural)
            if (!curFile) {
                curFile = currentFiles.find(f => {
                    const curBase = path.basename(f.path).replace(/\.ts$/, "").replace(/\.py$/, "").toLowerCase();
                    return curBase === normName.toLowerCase() || curBase === targetName.toLowerCase();
                });
            }

            if (!curFile && FILE_MAPPINGS[fileName]) {
                const targetPath = FILE_MAPPINGS[fileName]!;
                curFile = currentFiles.find(f => f.path.replace(/\\/g, "/").endsWith(targetPath));
            }

            // Análise Atômica de Evolução (Atomic Extraction)
            const legUnits = legFile.units || [];
            const curUnits = curFile ? (curFile.units || []) : [];

            if (!curFile) {
                // Conhecimento: Verificar se o arquivo foi movido para arquivos legados ou manutenção no projeto atual
                // Usando scan recursivo rápido para busca de arquivados
                const allFiles = this.recursiveReaddir(projectRoot, [".ts", ".py", ".go", ".kt", ".dart", ".js"]);
                const archivedFile = allFiles.find(f =>
                    f.toLowerCase().includes(fileName.toLowerCase()) &&
                    (f.includes("legacy_archive") || f.includes("archive") || f.includes("scripts") || f.includes("tests"))
                );

                if (archivedFile) {
                    findings.push({
                        type: "TRANSITION",
                        severity: "INFO",
                        file: archivedFile,
                        issue: `Arquivo '${fileName}' reconhecido como arquivado/manutenção em '${archivedFile}'.`,
                        category: "Structural"
                    });
                    continue;
                }

                // Se for um teste legado que ainda não foi migrado para .test.ts, mas existe como .py no atual (para referência)
                const existsAsPy = currentFiles.find(f => f.path === legFile.path);
                if (existsAsPy) {
                    findings.push({
                        type: "TRANSITION",
                        severity: "INFO",
                        file: legFile.path,
                        issue: `Teste '${fileName}' mantido em Python para referência. Migração para Bun pendente.`,
                        category: "Structural"
                    });
                    continue;
                }

                findings.push({
                    type: "DISPARITY",
                    severity: "CRITICAL",
                    file: `src_local/${legPath}`,
                    issue: `Arquivo ${legPath} existe no legado mas está AUSENTE no atual (não mapeado).`,
                    category: "Structural",
                    meta: { missing: legUnits.map(u => u.name), level: "DELETED", isFile: true }
                });
                continue;
            }
            const norm = (name: string) => name.toLowerCase().replace(/_/g, "");

            // v7.3: Intellectual Parity (Fuzzy Match snake_case vs camelCase)
            const missingUnits = legUnits.filter(lu => {
                let normalizedLu = norm(lu.name);
                // v7.4: Constructor Parity (__init__ -> constructor)
                if (normalizedLu === "init") normalizedLu = "constructor";

                const found = curUnits.some(cu => norm(cu.name) === normalizedLu);
                if (fileName === "base.py" || fileName === "orchestrator.py") {
                    logger.info(`🔍 [Discovery] Matching ${lu.name} (${normalizedLu}): ${found ? "FOUND" : "MISSING"}`);
                }
                return !found;
            });

            if (fileName === "base.py" || fileName === "orchestrator.py") {
                logger.info(`🔍 [Discovery] ${fileName} -> ${curFile ? curFile.path : "NONE"} | Units: LEG=${legUnits.length} CUR=${curUnits.length}`);
                curUnits.forEach(cu => logger.info(`   - CUR Unit: ${cu.name} (${norm(cu.name)})`));
            }

            const newUnits = curUnits.filter(cu => {
                const normalizedCu = norm(cu.name);
                return !legUnits.some(lu => norm(lu.name) === normalizedCu);
            });

            // Evitar duplicidade de report para componentes soberanos que absorveram múltiplos legados
            const isConsolidated = mappedSovereign.has(curFile.path);
            mappedSovereign.add(curFile.path);

            if (missingUnits.length > 0) {
                // Especial para testes: Se mudou de Unittest para Bun, as unidades atômicas (metodos de classe) mudam de nome/estilo
                const isTestMigration = isTest && curFile.path.endsWith(".test.ts");
                const severity = isTestMigration ? "LOW" : (missingUnits.length > legUnits.length / 2 ? "HIGH" : "MEDIUM");
                const level = missingUnits.length > legUnits.length / 2 ? "SHALLOW" : "PARITY_GAPS";

                findings.push({
                    type: isTestMigration ? "EVOLUTION" : "DISPARITY",
                    severity: isConsolidated ? "INFO" : severity,
                    file: curFile.path,
                    issue: isTestMigration
                        ? `Teste '${fileName}' evoluído para Bun. Estrutura atômica alterada (Natural).`
                        : `A migração de '${fileName}' para '${path.basename(curFile.path)}' está ${level}. Faltam ${missingUnits.length} unidades.`,
                    category: isTestMigration ? "Structural" : "AtomicParity",
                    meta: { missing: missingUnits.map(u => u.name), level, isTest: isTestMigration, consolidated: isConsolidated }
                });
            } else if (newUnits.length > 0 && !isConsolidated) {
                findings.push({
                    type: "EVOLUTION",
                    severity: "INFO",
                    file: curFile.path,
                    issue: `Componente '${path.basename(curFile.path)}' evoluiu com ${newUnits.length} novas funcionalidades em relação ao legado.`,
                    category: "Structural",
                    meta: { added: newUnits.map(u => u.name) }
                });
            }
        }

        // 2. Análise de Profundidade (Inteligência Superior)
        logger.info("🧠 Executando Auditoria de Profundidade e Soberania...");
        const tsFiles = this.recursiveReaddir(currentRoot, [".ts", ".tsx", ".js", ".jsx"]);
        const pyFiles = this.recursiveReaddir(legacyRoot, [".py"]);

        const atomicUnits = [...legacyFiles, ...currentFiles];

        logger.info(`🧠 Invocando DepthIntelligence com ${atomicUnits.length} unidades atômicas...`);
        const depthAudit = await DepthIntelligence.calculateDepthAudit(projectRoot, tsFiles, pyFiles, atomicUnits);

        // 3. Análise de Contexto Clássica
        const ctx = await this.orc.contextEngine.analyzeProject();
        ctx.atomicUnits = currentFiles;
        ctx.depthAudit = depthAudit;

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
                    const forbidden = ["node_modules", ".git", ".gemini", "dist", "artifacts"];
                    if (forbidden.includes(item.name)) continue;
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
