import winston from "winston";
import { GoDiscoveryAdapter } from "../../../utils/go_discovery_adapter.ts";
import type { FileAnalysis } from "../../../utils/go_discovery_adapter.ts";
import { Path } from "../../../core/path_utils.ts";
import { DepthIntelligence } from "../../../utils/depth_intelligence.ts";
import * as fs from "node:fs";
import * as path from "node:path";
import { IGNORE_LIST } from "./parity_config";

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
        logger.info("🔭 Iniciando fase de descoberta (Soberania Nativa: Multi-Stack consistency)...");

        const projectRoot = this.orc.projectRoot.toString();
        const currentRoot = projectRoot;

        // 1. Scan Atômico Nativo (Todas as Stacks internas)
        const currentFilesRaw = GoDiscoveryAdapter.scan(currentRoot, currentRoot, false);

        // Filter only agents/stack folders
        const stacks = ["Bun", "Flutter", "Go", "Kotlin", "Python", "TypeScript"];
        const agentFilesRaw = currentFilesRaw.filter(f =>
            stacks.some(s => f.path.replace(/\\/g, "/").startsWith(`src_local/agents/${s}`))
        );

        // Enrichment Phase: Universal Unit Extraction
        const allAgentFiles = await Promise.all(agentFilesRaw.map(async f => {
            try {
                const content = await fs.promises.readFile(path.join(currentRoot, f.path), "utf-8");
                let analysis;
                if (f.path.endsWith(".py")) analysis = this.parser.analyzePy(content);
                else if (f.path.endsWith(".kt")) analysis = this.parser.analyzeKt(content);
                else if (f.path.endsWith(".go")) analysis = this.parser.analyzeGo(content);
                else if (f.path.endsWith(".dart")) analysis = this.parser.analyzeDart(content);
                else analysis = this.parser.analyzeTs(content);

                return {
                    ...f,
                    units: [
                        ...analysis.classes.map(c => ({ name: c, type: "class" as const, line: 1 })),
                        ...(analysis.functions || []).map(fn => ({ name: fn, type: "function" as const, line: 1 }))
                    ]
                };
            } catch (err) {
                return f;
            }
        }));


        const findings: any[] = [];
        const mappedSovereign = new Set<string>();

        // Mapeamento Inteligente de Disparidades
        // 2. Agrupamento por Persona (Identidade Cross-Language)
        const personaGroups: Record<string, any[]> = {};
        for (const file of allAgentFiles) {
            const fileName = path.basename(file.path);
            if (IGNORE_LIST.includes(fileName) || fileName.startsWith("__")) continue;

            const normName = fileName
                .replace(/\.(ts|py|go|kt|dart)$/, "")
                .replace(/_?persona$/, "")
                .replace(/_?agent$/, "")
                .replace(/_?system$/, "")
                .replace(/_?engine$/, "");

            const personaId = normName.toLowerCase();
            if (!personaGroups[personaId]) personaGroups[personaId] = [];
            personaGroups[personaId].push(file);
        }

        // 3. Mapeamento Inteligente de Disparidades Críticas (Cross-Stack)
        const norm = (name: string) => name.toLowerCase().replace(/_/g, "").replace(/init/g, "constructor");

        for (const [personaId, files] of Object.entries(personaGroups)) {
            if (files.length < 2) continue; // Persona única em uma linguagem (Evolução Nativa)

            // Criar União de todas as unidades atômicas (O Gold Standard é a união de todas)
            const allUnits = new Set<string>();
            files.forEach(f => (f.units || []).forEach((u: any) => allUnits.add(norm(u.name))));

            for (const file of files) {
                const curUnits = (file.units || []).map((u: any) => norm(u.name));
                const missingUnits = Array.from(allUnits).filter(u => !curUnits.includes(u));

                if (missingUnits.length > 0) {
                    findings.push({
                        type: "DISPARITY",
                        severity: missingUnits.length > 3 ? "HIGH" : "MEDIUM",
                        file: file.path,
                        issue: `A persona '${personaId}' na stack '${file.path.split('/')[2]}' está incompleta. Faltam ${missingUnits.length} unidades em relação ao padrão cross-stack.`,
                        category: "AtomicParity",
                        meta: { missing: missingUnits, level: "PARITY_GAPS" }
                    });
                }
            }
        }

        // 4. Análise de Profundidade (Native Version)
        logger.info("🧠 Executando Auditoria de Profundidade Nativa...");
        const nativeFiles = this.recursiveReaddir(currentRoot, [".ts", ".tsx", ".js", ".py", ".go", ".kt"]);
        const atomicUnits = allAgentFiles;

        logger.info(`🧠 Invocando DepthIntelligence com ${atomicUnits.length} unidades atômicas...`);
        const depthAudit = await DepthIntelligence.calculateDepthAudit(projectRoot, nativeFiles, [], atomicUnits);


        // 3. Análise de Contexto Clássica
        const ctx = await this.orc.contextEngine.analyzeProject();
        ctx.atomicUnits = allAgentFiles;
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
