
import { HubManagerGRPC } from "../core/hub_manager_grpc.ts";
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
import type { CognitiveStatus, IAgent } from "../core/types.ts";

/**
 * 🧠 Cérebro Semântico PhD (Bun Version).
 */
export class ContextEngine {
    projectRoot: Path; 
    map: Record<string, any> = {}; 
    callGraph: Record<string, string[]> = {};
    dnaProfiler: DNAProfiler; 
    mappingLogic: ContextMappingLogic;
    analyst: StructuralAnalyst; 
    coverageAuditor = new CoverageAuditor();
    connectivityMapper: ConnectivityMapper; 
    parityAnalyst = new ParityAnalyst();
    metricsEngine = new MetricsEngine(); 
    allFilesIndex: string[] = [];
    projectIdentity: Record<string, unknown> = {};
    private contentCache: Record<string, string> = {};

    constructor(projectRoot: string, private hubManager?: HubManagerGRPC) {
        this.projectRoot = new Path(projectRoot);
        this.dnaProfiler = new DNAProfiler(hubManager);
        this.connectivityMapper = new ConnectivityMapper(hubManager);
        this.analyst = new StructuralAnalyst(hubManager);
        this.mappingLogic = new ContextMappingLogic(hubManager);
    }

    async analyzeProject(): Promise<{ identity: Record<string, unknown>; map: Record<string, any> }> {
        this.projectIdentity = await this.dnaProfiler.discoverIdentity(this.projectRoot);
        const scanner = new FileSystemScanner(this.projectRoot.toString(), this.analyst);
        this.allFilesIndex = await scanner.scanAllFilenames();

        const goMap = await this.getGoDiscoveryMap();
        this.contentCache = await this.mappingLogic.processBatch(scanner, this, goMap);

        await this.buildDependencyMap();
        return { identity: this.projectIdentity, map: this.map };
    }

    private async getGoDiscoveryMap(): Promise<Record<string, any>> {
        const { GoDiscoveryAdapter } = await import("./go_discovery_adapter.ts");
        const { results: goResults } = await GoDiscoveryAdapter.scan(this.projectRoot.toString(), this.projectRoot.toString(), this.hubManager);
        const goMap: Record<string, any> = {};
        goResults.forEach(r => goMap[r.path.replace(/\\/g, "/")] = r);
        return goMap;
    }

    async registerFile(path: Path, ignoreTest: boolean = false, goMetrics?: any) {
        const rel = path.relativeTo(this.projectRoot);
        if (this.map[rel]) return;

        const content = await this.getCachedContent(path, rel);
        const info = this.mappingLogic.getInitialInfo(path, rel, this.analyst);

        const rustMeta = this.mappingLogic.metadataCache[rel.replace(/\\/g, "/")];
        if (rustMeta) {
            info.rust_metadata = rustMeta;
        }

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
        await this._applyStructuralAnalysis(path, content, info);
        this._applyAdvancedMetrics(path, content, info, info.atomic_go_metrics);
        await this._applySecurityAndTests(path, content, info, ignoreTest);
    }

    private async _applyStructuralAnalysis(path: Path, content: string, info: any) {
        const name = path.name();
        const structural = path.toString().endsWith('.py')
            ? await this.analyst.analyzePython(content, name)
            : await this.analyst.analyze_file_logic(content, name);

        // Add intent classification using Rust metadata if available
        info.intent = this.analyst.analyze_intent(content, name, info.rust_metadata);

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

    private async buildDependencyMap() {
        const bulkResults = await this.connectivityMapper.calculateBulk(this.map);
        const hasBulk = Object.keys(bulkResults).length > 0;

        Object.keys(this.map).forEach(f => {
            if (hasBulk && bulkResults[f]) {
                this.map[f].coupling = bulkResults[f];
            } else {
                this.map[f].coupling = this.connectivityMapper.calculateMetrics(f, this.map[f], this.map);
            }
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

    analyzeStackParity(personas: IAgent[]) { 
        const p = this.parityAnalyst.analyzeStackGaps(personas) as any; 
        p.detected = (this.projectIdentity.stacks as Set<string>) || new Set<string>(); 
        return p; 
    }
    async cognitiveReason(p: string): Promise<CognitiveStatus> { 
        const res = await (await new (await import("./cognitive_engine.ts")).CognitiveEngine()).reason(p); 
        if (typeof res === 'string') return { status: res, score: 0 };
        return res || { status: "Unknown", score: 0 };
    }
    _getScanner() { return new FileSystemScanner(this.projectRoot.toString(), this.analyst); }
    get_criticality_score(f: string) { return ContextHelpers.getCriticalityScore(f, this.map); }
}
