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
import { ContextHelpers } from "./context_helpers.ts";

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
    projectIdentity: any = {};
    private contentCache: Record<string, string> = {};

    constructor(projectRoot: string) { this.projectRoot = new Path(projectRoot); }

    async analyzeProject(): Promise<any> {
        this.projectIdentity = await this.dnaProfiler.discoverIdentity(this.projectRoot);
        const scanner = new FileSystemScanner(this.projectRoot.toString(), this.analyst);
        this.allFilesIndex = await scanner.scanAllFilenames();

        const goMap = await this.getGoDiscoveryMap();
        this.contentCache = await this.mappingLogic.processBatch(scanner, this, goMap);

        this.buildDependencyMap();
        return { identity: this.projectIdentity, map: this.map };
    }

    private async getGoDiscoveryMap(): Promise<Record<string, any>> {
        const { GoDiscoveryAdapter } = await import("./go_discovery_adapter.ts");
        const { results: goResults } = await GoDiscoveryAdapter.scan(this.projectRoot.toString(), this.projectRoot.toString(), false);
        const goMap: Record<string, any> = {};
        goResults.forEach(r => goMap[r.path.replace(/\\/g, "/")] = r);
        return goMap;
    }

    async registerFile(path: Path, ignoreTest: boolean = false, goMetrics?: any) {
        const rel = path.relativeTo(this.projectRoot);
        if (this.map[rel]) return;

        const content = await this.getCachedContent(path, rel);
        const info = this.mappingLogic.getInitialInfo(path, rel, this.analyst);
        info.content = content;

        if (goMetrics) {
            info.atomic_go_metrics = {
                totalComplexity: goMetrics.total_complexity,
                cognitiveComplexity: goMetrics.cognitive_complexity,
                maxNesting: goMetrics.max_nesting,
                loc: goMetrics.loc,
                sloc: goMetrics.sloc,
                comments: goMetrics.comments
            };
        }

        await this.performDeepAnalysis(path, content, info, ignoreTest);
        this.map[rel] = info;
    }

    private async getCachedContent(path: Path, rel: string): Promise<string> {
        if (this.contentCache[rel]) return this.contentCache[rel]!;
        return this.readFileContent(path);
    }

    private async readFileContent(path: Path): Promise<string> {
        try {
            return await (Bun as any).file(path.toString()).text();
        } catch {
            return "";
        }
    }

    private async performDeepAnalysis(path: Path, content: string, info: any, ignoreTest: boolean) {
        this._applyStructuralAnalysis(path, content, info);
        this._applyAdvancedMetrics(path, content, info, info.atomic_go_metrics);
        await this._applySecurityAndTests(path, content, info, ignoreTest);
    }

    private _applyStructuralAnalysis(path: Path, content: string, info: any) {
        const name = path.name();
        const structural = path.toString().endsWith('.py')
            ? this.analyst.analyzePython(content, name)
            : this.analyst.analyze_file_logic(content, name);
        Object.assign(info, structural);
    }

    private _applyAdvancedMetrics(path: Path, content: string, info: any, goMetrics?: any) {
        const rel = path.relativeTo(this.projectRoot).replace(/\\/g, "/");
        const adv = this.metricsEngine.analyzeFile(content, rel, info.dependencies || [], 0, goMetrics);

        Object.assign(info, {
            advanced_metrics: { ...adv },
            telemetry: adv.telemetry || info.telemetry,
            complexity: adv.cyclomaticComplexity
        });

        this.enrichShadowCompliance(info, adv);
    }

    private enrichShadowCompliance(info: any, adv: any) {
        if (adv.isShadow) {
            const v = this.metricsEngine.validateShadowCompliance(adv);
            Object.assign(info, {
                shadow_compliance: { compliant: v.compliant, reason: v.reason },
                complexity: adv.shadowComplexity
            });
        }
    }

    private async _applySecurityAndTests(path: Path, content: string, info: any, ignoreTest: boolean) {
        const vuln = await this.analyst.integrityGuardian.detectVulnerabilities(content, info.component_type, path.name(), ignoreTest);
        Object.assign(info, vuln);

        info.has_test = this.coverageAuditor.detectTest(path, info.component_type, this.allFilesIndex, info);
        this.enrichTestDepth(content, info);
    }

    private enrichTestDepth(content: string, info: any) {
        if (info.component_type === "TEST") {
            const matches = (content.match(/assert|expect|should/g) || []).length;
            info.test_depth = { assertion_count: matches, quality_level: matches > 5 ? "DEEP" : "SHALLOW" };
        }
    }

    private buildDependencyMap() {
        Object.keys(this.map).forEach(f => {
            this.map[f].coupling = this.connectivityMapper.calculateMetrics(f, this.map[f], this.map);
        });
        this.callGraph = {};
        this.populateCallGraph();
    }

    private populateCallGraph() {
        Object.entries(this.map).forEach(([f, d]) => {
            (d.dependencies || []).forEach((dep: string) => {
                const res = ContextHelpers.resolveDependency(dep, this.map);
                if (res && res !== f) {
                    (this.callGraph[res] ||= []).push(f);
                }
            });
        });
    }

    analyzeStackParity(personas: any[]) { const p = this.parityAnalyst.analyzeStackGaps(personas) as any; p.detected = this.projectIdentity.stacks || new Set(); return p; }
    async cognitiveReason(p: string) { return (await new (await import("./cognitive_engine.ts")).CognitiveEngine()).reason(p); }
    _getScanner() { return new FileSystemScanner(this.projectRoot.toString(), this.analyst); }
    get_criticality_score(f: string) { return ContextHelpers.getCriticalityScore(f, this.map); }
}
