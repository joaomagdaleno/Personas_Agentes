import winston from "winston";
import { Path } from "../core/path_utils.ts";
import { DNAProfiler } from "../agents/Support/Analysis/dna_profiler.ts";
import { ContextMappingLogic } from "./context_mapping_logic.ts";
import { FileSystemScanner } from "./file_system_scanner.ts";
import { StructuralAnalyst } from "../agents/Support/Analysis/structural_analyst.ts";
import { CoverageAuditor } from "../agents/Support/Analysis/coverage_auditor.ts";
import { ConnectivityMapper } from "../agents/Support/Analysis/connectivity_mapper.ts";
import { ParityAnalyst } from "../agents/Support/Analysis/parity_analyst.ts";

const logger = winston.child({ module: "ContextEngine" });

/**
 * 🧠 Cérebro Semântico PhD (Bun Version).
 */
export class ContextEngine {
    projectRoot: Path;
    map: Record<string, any> = {};
    callGraph: Record<string, any> = {};
    projectIdentity: any = {};
    dnaProfiler: DNAProfiler;
    mappingLogic: ContextMappingLogic;
    analyst: StructuralAnalyst;
    coverageAuditor: CoverageAuditor;
    connectivityMapper: ConnectivityMapper;
    parityAnalyst: ParityAnalyst;
    allFilesIndex: string[] = [];
    private contentCache: Record<string, string> = {};

    constructor(projectRoot: string) {
        this.projectRoot = new Path(projectRoot);
        this.dnaProfiler = new DNAProfiler();
        this.mappingLogic = new ContextMappingLogic();
        this.analyst = new StructuralAnalyst();
        this.coverageAuditor = new CoverageAuditor();
        this.connectivityMapper = new ConnectivityMapper();
        this.parityAnalyst = new ParityAnalyst();
    }

    async analyzeProject(): Promise<any> {
        logger.info("🧠 Mapeando topologia...");
        console.log("🐛 [ContextEngine] Descobrindo identidade do projeto...");
        this.projectIdentity = await this.dnaProfiler.discoverIdentity(this.projectRoot);
        console.log("🐛 [ContextEngine] Identidade descoberta. Iniciando FileSystemScanner...");

        const scanner = new FileSystemScanner(this.projectRoot.toString(), this.analyst);
        console.log("🐛 [ContextEngine] Escaneando nomes de arquivos...");
        this.allFilesIndex = await scanner.scanAllFilenames();
        console.log(`🐛 [ContextEngine] Escaneados ${this.allFilesIndex.length} arquivos.`);
        this.map = {};

        this.contentCache = await this.mappingLogic.processBatch(scanner, this);
        this.buildDependencyMap();

        logger.info(`✅ DNA Processado: ${Object.keys(this.map).length} componentes.`);
        return { identity: this.projectIdentity, map: this.map };
    }

    async registerFile(path: Path, ignoreTestContext: boolean = false) {
        try {
            const relPath = path.relativeTo(this.projectRoot);
            if (this.map[relPath]) return;

            await this.analyzeSingleFile(path, relPath, ignoreTestContext);
        } catch (e) {
            logger.error(`❌ Erro ao analisar ${path.toString()}: ${e}`);
        }
    }

    private async analyzeSingleFile(path: Path, relPath: string, ignoreTest: boolean) {
        const content = await this.getCachedContent(path, relPath);
        const info = this.mappingLogic.getInitialInfo(path, relPath, this.analyst);
        info.content = content;

        await this.performDeepAnalysis(path, content, info, ignoreTest);
        this.map[relPath] = info;
    }

    private async getCachedContent(path: Path, relPath: string): Promise<string> {
        if (this.contentCache[relPath]) return this.contentCache[relPath]!;
        try {
            return await Bun.file(path.toString()).text();
        } catch {
            return "";
        }
    }

    private async performDeepAnalysis(path: Path, content: string, info: any, ignoreTest: boolean) {
        if (path.toString().endsWith('.py')) {
            Object.assign(info, this.analyst.analyzePython(content, path.name()));
        } else {
            // TypeScript/JS/Go support via StructuralAnalyst
            const metrics = this.analyst.analyze_file_logic(content, path.name());
            if (metrics) {
                info.complexity = metrics.complexity || 1;
                info.dependencies = metrics.dependencies || [];
                // Merge other structural data if available
                if (metrics.functions) info.functions = metrics.functions;
            }
        }

        // Logic Auditor / Integrity Guardian
        Object.assign(info, await this.analyst.integrityGuardian.detectVulnerabilities(content, info.component_type, ignoreTest));

        // Coverage Audit
        info.has_test = this.coverageAuditor.detectTest(path, info.component_type, this.allFilesIndex, info);

        if (info.component_type === "TEST") {
            this.analyzeTestQuality(content, info);
        }
    }

    private analyzeTestQuality(content: string, info: any) {
        const assertions = (content.match(/assert|expect|should/g) || []).length;
        info.test_depth = {
            assertion_count: assertions,
            quality_level: assertions > 5 ? "DEEP" : "SHALLOW"
        };
    }

    private buildDependencyMap() {
        for (const [file, data] of Object.entries(this.map)) {
            data.coupling = this.connectivityMapper.calculateMetrics(file, data, this.map);
        }

        // Inverter o mapa de dependências para encontrar dependentes de forma eficiente
        this.callGraph = {};
        for (const [file, data] of Object.entries(this.map)) {
            const deps = data.dependencies || [];
            for (const dep of deps) {
                // Tenta resolver a dependência para um arquivo no mapa
                const resolved = this.resolveDependency(dep);
                if (resolved && resolved !== file) {
                    if (!this.callGraph[resolved]) this.callGraph[resolved] = [];
                    if (!this.callGraph[resolved].includes(file)) {
                        this.callGraph[resolved].push(file);
                    }
                }
            }
        }
    }

    private resolveDependency(depName: string): string | null {
        // Busca simples por nome de arquivo (procura por match no final do path)
        const lowerDep = depName.toLowerCase().replace(/\./g, '/');
        for (const file of Object.keys(this.map)) {
            const fileLower = file.toLowerCase();
            if (fileLower.endsWith(`${lowerDep}.ts`) ||
                fileLower.endsWith(`${lowerDep}.py`) ||
                fileLower.endsWith(`/${lowerDep}`)) {
                return file;
            }
        }
        return null;
    }

    analyzeStackParity(personas: any[]): any {
        const parity = this.parityAnalyst.analyzeStackGaps(personas);
        parity.detected = this.projectIdentity.stacks || new Set();
        return parity;
    }

    async cognitiveReason(prompt: string): Promise<string | null> {
        const { CognitiveEngine } = await import("./cognitive_engine.ts");
        const engine = new CognitiveEngine();
        return await engine.reason(prompt);
    }

    /** v7.3: Parity Restoration */
    _injectSupport() {
        logger.info("💉 [ContextEngine] Injetando suporte sistêmico...");
    }

    _initializeSupportTools() {
        logger.info("🛠️ [ContextEngine] Inicializando ferramentas de suporte...");
    }

    _getScanner() {
        return new FileSystemScanner(this.projectRoot.toString(), this.analyst);
    }

    _findDependents(file: string) {
        return this.callGraph[file] || [];
    }

    get_criticality_score(file: string) {
        const data = this.map[file];
        if (!data) return 0;
        return (data.complexity || 1) * (data.coupling?.total || 1);
    }

    /** Parity: _process_files_in_batch — Processes file analysis in batched parallel. */
    async _process_files_in_batch(files: string[], batchSize: number = 20): Promise<void> {
        for (let i = 0; i < files.length; i += batchSize) {
            const batch = files.slice(i, i + batchSize);
            await Promise.all(batch.map(async (f) => {
                try {
                    await this.registerFile(new (await import("../core/path_utils.ts")).Path(f));
                } catch (e) {
                    logger.warn(`⚠️ [ContextEngine] Batch skip: ${f} — ${e}`);
                }
            }));
        }
    }
}
