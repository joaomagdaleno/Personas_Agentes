import winston from "winston";
import { Path } from "../core/path_utils.ts";
import { DNAProfiler } from "../agents/Support/dna_profiler.ts";
import { ContextMappingLogic } from "./context_mapping_logic.ts";
import { FileSystemScanner } from "./file_system_scanner.ts";
import { StructuralAnalyst } from "../agents/Support/structural_analyst.ts";
import { CoverageAuditor } from "../agents/Support/coverage_auditor.ts";
import { ConnectivityMapper } from "../agents/Support/connectivity_mapper.ts";
import { ParityAnalyst } from "../agents/Support/parity_analyst.ts";

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
        this.projectIdentity = await this.dnaProfiler.discoverIdentity(this.projectRoot);

        const scanner = new FileSystemScanner(this.projectRoot.toString(), this.analyst);
        this.allFilesIndex = await scanner.scanAllFilenames();
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
            this.callGraph[file] = this.findDependents(file, data);
        }
    }

    private findDependents(file: string, data: any): string[] {
        const stem = new Path(file).stem();
        return Object.keys(this.map).filter(f => f !== file && JSON.stringify(this.map[f]).includes(stem));
    }

    analyzeStackParity(personas: any[]): any {
        const parity = this.parityAnalyst.analyzeStackGaps(personas);
        parity.detected = this.projectIdentity.stacks || new Set();
        return parity;
    }
}
