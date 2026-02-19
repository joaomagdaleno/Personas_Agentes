import winston from "winston";
import { Path } from "../core/path_utils.ts";
import { DNAProfiler } from "../agents/Support/Analysis/dna_profiler.ts";
import { ContextMappingLogic } from "./context_mapping_logic.ts";
import { FileSystemScanner } from "./file_system_scanner.ts";
import { StructuralAnalyst } from "../agents/Support/Analysis/structural_analyst.ts";
import { CoverageAuditor } from "../agents/Support/Analysis/coverage_auditor.ts";
import { ConnectivityMapper } from "../agents/Support/Analysis/connectivity_mapper.ts";
import { ParityAnalyst } from "../agents/Support/Analysis/parity_analyst.ts";
import { MetricsEngine } from "../agents/Support/Diagnostics/metrics_engine.ts";

const logger = winston.child({ module: "ContextEngine" });

/**
 * 🧠 Cérebro Semântico PhD (Bun Version).
 */
export class ContextEngine {
    projectRoot: Path; map: Record<string, any> = {}; callGraph: Record<string, any> = {};
    dnaProfiler = new DNAProfiler(); mappingLogic = new ContextMappingLogic();
    analyst = new StructuralAnalyst(); coverageAuditor = new CoverageAuditor();
    connectivityMapper = new ConnectivityMapper(); parityAnalyst = new ParityAnalyst();
    metricsEngine = new MetricsEngine(); allFilesIndex: string[] = [];
    private contentCache: Record<string, string> = {};

    constructor(projectRoot: string) { this.projectRoot = new Path(projectRoot); }

    async analyzeProject(): Promise<any> {
        this.projectIdentity = await this.dnaProfiler.discoverIdentity(this.projectRoot);
        const scanner = new FileSystemScanner(this.projectRoot.toString(), this.analyst);
        this.allFilesIndex = await scanner.scanAllFilenames();
        this.contentCache = await this.mappingLogic.processBatch(scanner, this);
        this.buildDependencyMap();
        return { identity: this.projectIdentity, map: this.map };
    }

    async registerFile(path: Path, ignoreTest: boolean = false) {
        const rel = path.relativeTo(this.projectRoot);
        if (this.map[rel]) return;
        const content = await this.getCachedContent(path, rel);
        const info = this.mappingLogic.getInitialInfo(path, rel, this.analyst);
        info.content = content;
        await this.performDeepAnalysis(path, content, info, ignoreTest);
        this.map[rel] = info;
    }

    private async getCachedContent(path: Path, rel: string): Promise<string> {
        if (this.contentCache[rel]) return this.contentCache[rel]!;
        try { return await Bun.file(path.toString()).text(); } catch { return ""; }
    }

    private async performDeepAnalysis(path: Path, content: string, info: any, ignoreTest: boolean) {
        const structural = path.toString().endsWith('.py') ? this.analyst.analyzePython(content, path.name()) : this.analyst.analyze_file_logic(content, path.name());
        Object.assign(info, structural);

        const adv = this.metricsEngine.analyzeFile(content, path.relativeTo(this.projectRoot).replace(/\\/g, "/"), info.dependencies || []);
        info.advanced_metrics = { ...adv };
        info.telemetry = adv.telemetry || info.telemetry;
        info.complexity = adv.cyclomaticComplexity;

        if (adv.isShadow) {
            const v = this.metricsEngine.validateShadowCompliance(adv);
            info.shadow_compliance = { compliant: v.compliant, reason: v.reason };
            info.complexity = adv.shadowComplexity;
        }

        Object.assign(info, await this.analyst.integrityGuardian.detectVulnerabilities(content, info.component_type, ignoreTest));
        info.has_test = this.coverageAuditor.detectTest(path, info.component_type, this.allFilesIndex, info);
        if (info.component_type === "TEST") info.test_depth = { assertion_count: (content.match(/assert|expect|should/g) || []).length, quality_level: (content.match(/assert|expect|should/g) || []).length > 5 ? "DEEP" : "SHALLOW" };
    }

    private buildDependencyMap() {
        Object.keys(this.map).forEach(f => this.map[f].coupling = this.connectivityMapper.calculateMetrics(f, this.map[f], this.map));
        this.callGraph = {};
        Object.entries(this.map).forEach(([f, d]) => (d.dependencies || []).forEach((dep: string) => {
            const resolved = this.resolveDependency(dep);
            if (resolved && resolved !== f) (this.callGraph[resolved] = this.callGraph[resolved] || []).push(f);
        }));
    }

    private resolveDependency(dep: string): string | null {
        const lower = dep.toLowerCase().replace(/\./g, '/');
        return Object.keys(this.map).find(f => f.toLowerCase().match(new RegExp(`${lower}(\\.ts|\\.py|$)`))) || null;
    }

    analyzeStackParity(personas: any[]) { const p = this.parityAnalyst.analyzeStackGaps(personas) as any; p.detected = this.projectIdentity.stacks || new Set(); return p; }
    async cognitiveReason(p: string) { return (await new (await import("./cognitive_engine.ts")).CognitiveEngine()).reason(p); }
    _injectSupport() { }
    _initializeSupportTools() { }
    _getScanner() { return new FileSystemScanner(this.projectRoot.toString(), this.analyst); }
    _findDependents(f: string) { return this.callGraph[f] || []; }
    get_criticality_score(f: string) { return (this.map[f]?.complexity || 0) * (this.map[f]?.coupling?.total || 1); }
}
