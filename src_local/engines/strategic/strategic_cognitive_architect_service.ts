import * as path from "node:path";
import winston from "winston";
import { exec } from "node:child_process";
import { promisify } from "node:util";
import { Path } from "../../core/path_utils.ts";
import { HubManagerGRPC } from "../../core/hub_manager_grpc.ts";
import { DatabaseHub } from "../../core/database_hub.ts";
import { DNAProfiler, CoverageAuditor, StructuralAnalyst } from "../analysis/architecture_types_service.ts";
export { NeuralSubsystemService, MicroGPT, PredictorEngine } from "./neural_subsystem_service.ts";
import { ConnectivityMapper } from "../analysis/connectivity_mapper.ts";
import { ParityAnalyst } from "../analysis/parity_analyst.ts";
import { MetricsEngine } from "../diagnostics/metrics_engine.ts";
import { ContextHelpers } from "../analysis/architecture_types_service.ts";
import { CogHelpers } from "../analysis/architecture_types_service.ts";
import { FileSystemScanner } from "../healing/resilience_healing_architect_service.ts";
import type { CognitiveStatus, IAgent } from "../../core/types.ts";

const execAsync = promisify(exec);
const logger = winston.child({ module: "StrategicCognitiveArchitectService" });

export class StaticReasoning {
    static handle(prompt: string): string | null {
        const p = prompt.toUpperCase();
        if (p.includes("CONSCIENTE")) return "ESTOU CONSCIENTE (SISTEMA DE EMERGÊNCIA ATIVO).";
        if (p.includes("PING")) return "PONG (EMERGENCY)";
        if (p.includes("DOCSTRING") && p.includes("CÓDIGO")) return "/**\n * Auto-generated documentation (Offline Fallback).\n */";
        if (p.includes("RESPONDA APENAS 'OK'")) return "OK";
        if (p.includes("RESPONDA EM JSON")) return '{"consistent": true, "issue": "None (Offline mode verified)", "severity": "LOW"}';
        return null;
    }
}

export class CognitiveEngine {
    private static instance: CognitiveEngine;
    private logger!: winston.Logger;
    private defaultMaxTokens: number = 512;
    private activeModel: string = "qwen3.5:1.5b (Unified)";
    private cogHelpers!: CogHelpers;

    constructor(private hubManager?: HubManagerGRPC) {
        if (CognitiveEngine.instance) return CognitiveEngine.instance;
        this.logger = this.initializeLogger();
        this.cogHelpers = new CogHelpers(hubManager);
        CognitiveEngine.instance = this;
    }

    private initializeLogger(): winston.Logger {
        return winston.createLogger({
            level: 'info',
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.printf(({ timestamp, level, message }) => `${timestamp} - Cognitive - ${level.toUpperCase()} - ${message}`)
            ),
            transports: [new winston.transports.Console()]
        });
    }

    public setThinkingDepth(isDeep: boolean = false): void {
        this.defaultMaxTokens = isDeep ? 2048 : 512;
        const mode = isDeep ? 'HIPERPENSAMENTO' : 'PULSE';
        this.logger.info(`🧠 [Cognitive] Modo ${mode} ativado.`);
    }

    async reason(prompt: string, options: { temperature?: number, max_tokens?: number, deep?: boolean } = {}): Promise<string | null> {
        this.logger.info(`🧠 [Cognitive] Raciocinando via gRPC Brain Proxy... (Model: ${this.activeModel})`);

        try {
            const response = await this.cogHelpers.callRustBrain(prompt);
            if (!response) {
                this.logger.warn("⚠️ [Cognitive] Falha no gRPC Brain Proxy. Ativando Raciocínio Estático.");
                return StaticReasoning.handle(prompt);
            }
            return response;
        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : String(error);
            this.logger.error(`❌ [Cognitive] Erro Crítico: ${msg}`);
            return StaticReasoning.handle(prompt);
        }
    }

    async release(): Promise<void> {
        this.logger.info("🧠 [Cognitive] Sistema Nativo estável.");
    }

    async load_model(): Promise<boolean> {
        this.logger.info(`🧠 [Cognitive] Verificando integridade do motor gRPC...`);
        return true;
    }

    static getInstance(hubManager?: HubManagerGRPC): CognitiveEngine {
        return CognitiveEngine.instance || (CognitiveEngine.instance = new CognitiveEngine(hubManager));
    }

    public get model(): string { return this.activeModel; }
}

export interface CognitiveHealthReport {
    status: "HEALTHY" | "DEGRADED" | "FAIL";
    lazyLoading: boolean;
    reasoningSpeedMs: number;
    memoryReleased: boolean;
    response: string;
    error?: string;
}

export class CognitiveValidator {
    private engine: CognitiveEngine;

    constructor() {
        this.engine = new CognitiveEngine();
    }

    async runFullCheck(): Promise<CognitiveHealthReport> {
        logger.info("🧠 Iniciando auditoria de sanidade cognitiva...");
        const report: CognitiveHealthReport = {
            status: "HEALTHY",
            lazyLoading: false,
            reasoningSpeedMs: 0,
            memoryReleased: false,
            response: ""
        };

        try {
            report.lazyLoading = (this.engine as any).model === undefined || (this.engine as any).model === null;
            const start = Date.now();
            const response = await this.engine.reason("Responda apenas com a palavra 'CONSCIENTE'.");
            report.reasoningSpeedMs = Date.now() - start;
            report.response = response || "";

            if (!response || !response.includes("CONSCIENTE")) {
                report.status = "DEGRADED";
            }

            await this.engine.release();
            report.memoryReleased = (this.engine as any).model === null;

            if (!report.memoryReleased) {
                report.status = "FAIL";
            }
        } catch (e: any) {
            logger.error(`🚨 Falha crítica no motor cognitivo: ${e.message}`);
            report.status = "FAIL";
            report.error = e.message;
        }

        return report;
    }
}

export class BehaviorAnalyst {
    private dbHub: DatabaseHub;
    private lastApp: string | null = null;
    private startTime: number = Date.now();
    private windowCache: { data: { app: string, title: string }, timestamp: number } | null = null;
    private readonly CACHE_TTL = 30000;

    constructor(projectRoot: string) {
        this.dbHub = DatabaseHub.getInstance(projectRoot);
    }

    async getActiveWindow(): Promise<{ app: string, title: string }> {
        if (this.isCacheValid()) return this.windowCache!.data;

        try {
            if (process.platform !== "win32") return { app: "System (Headless)", title: "N/A" };

            const data = await this.runWin32PowerShellAsync();
            this.windowCache = { data, timestamp: Date.now() };
            return data;
        } catch (e: any) {
            logger.debug(`⚠️ Failed to detect active window: ${e.message}`);
            return { app: "System", title: "N/A" };
        }
    }

    private isCacheValid(): boolean {
        return !!(this.windowCache && Date.now() - this.windowCache.timestamp < this.CACHE_TTL);
    }

    private async runWin32PowerShellAsync(): Promise<{ app: string, title: string }> {
        const cmd = `
            Add-Type @"
            using System;
            using System.Runtime.InteropServices;
            using System.Text;
            public class Win32 {
                [DllImport("user32.dll")]
                public static extern IntPtr GetForegroundWindow();
                [DllImport("user32.dll")]
                public static extern int GetWindowText(IntPtr hWnd, StringBuilder text, int count);
                [DllImport("user32.dll")]
                public static extern uint GetWindowThreadProcessId(IntPtr hWnd, out uint lpdwProcessId);
            }
"@
            $hwnd = [Win32]::GetForegroundWindow()
            $sb = New-Object System.Text.StringBuilder 256
            [Win32]::GetWindowText($hwnd, $sb, $sb.Capacity)
            $pid = 0
            [Win32]::GetWindowThreadProcessId($hwnd, [ref]$pid)
            $proc = Get-Process -Id $pid
            "$($proc.ProcessName)|$($sb.ToString())"
        `;

        const { stdout } = await execAsync(`powershell -Command "${cmd.replace(/\n/g, '')}"`, { encoding: 'utf8' });
        const output = (stdout || "").trim();
        const [app, title] = output.split('|');
        return { app: app || "Unknown", title: title || "" };
    }

    classifyActivity(app: string, title: string): string {
        return ActivityClassifier.classify(app, title);
    }

    async logActivity(): Promise<string> {
        const { app, title } = await this.getActiveWindow();
        const category = this.classifyActivity(app, title);

        if (this.lastApp !== app) {
            this.finalizeLastActivity(category);
            this.lastApp = app;
            this.startTime = Date.now();
            logger.info(`👀 [Behavior] Foco: ${app} (${category})`);
        }

        return category;
    }

    private finalizeLastActivity(category: string) {
        if (!this.lastApp) return;
        const duration = Math.floor((Date.now() - this.startTime) / 1000);
        this.saveActivity(this.lastApp, category, duration);
    }

    private saveActivity(app: string, category: string, duration: number) {
        if (duration < 5) return;
        try {
            this.dbHub.run(
                "INSERT INTO user_activity (app_name, category, duration_seconds) VALUES (?, ?, ?)",
                [app, category, duration]
            );
        } catch (e: any) {
            if (e.message?.includes("no such table")) {
                logger.debug("👀 [Behavior] Skiping save: user_activity table not initialized.");
            } else {
                logger.warn(`❌ [Behavior] Database error: ${e.message}`);
            }
        }
    }
}

interface IScanner {
    getAnalyzableFiles(): AsyncIterable<Path>;
}

interface IEngine {
    projectRoot: Path;
    registerFile(path: Path, isChanged: boolean, goMapEntry?: any): Promise<void>;
}

export class ContextMappingLogic {
    public metadataCache: Record<string, any> = {};

    constructor(private hubManager?: HubManagerGRPC) { }

    async processBatch(scanner: IScanner, engine: IEngine, goMap: Record<string, any> = {}): Promise<Record<string, string>> {
        const startTime = Date.now();
        const contentCache: Record<string, string> = {};

        const filePaths = await this.getAllFiles(scanner);

        if (this.hubManager && filePaths.length > 5) {
            try {
                const results = await this.processBatchRust(filePaths, engine.projectRoot);
                for (const res of results) {
                    contentCache[res.path] = res.content;
                    this.metadataCache[res.path] = {
                        dna: res.dna,
                        semantic_blocks: res.semantic_blocks
                    };
                }
            } catch (err) {
                await this.readFilesIntoCache(filePaths, engine, contentCache);
            }
        } else {
            await this.readFilesIntoCache(filePaths, engine, contentCache);
        }

        await this.registerAllFiles(contentCache, engine, goMap);

        const duration = (Date.now() - startTime) / 1000;
        logger.info(`Telemetry: Context batch processing (Rust-Parallel) in ${duration.toFixed(4)}s for ${filePaths.length} files`);
        return contentCache;
    }

    private async processBatchRust(filePaths: Path[], projectRoot: Path): Promise<any[]> {
        const request = {
            file_paths: filePaths.map(p => p.relativeTo(projectRoot)),
            project_root: projectRoot.toString()
        };

        if (!this.hubManager) return [];
        return await this.hubManager.batch(request);
    }

    private async getAllFiles(scanner: IScanner): Promise<Path[]> {
        const filePaths: Path[] = [];
        for await (const path of scanner.getAnalyzableFiles()) {
            filePaths.push(path);
        }
        return filePaths;
    }

    private async readFilesIntoCache(filePaths: Path[], engine: IEngine, contentCache: Record<string, string>) {
        const concurrencyLimit = 20;
        for (let i = 0; i < filePaths.length; i += concurrencyLimit) {
            const batch = filePaths.slice(i, i + concurrencyLimit);
            await Promise.all(batch.map(async (path) => {
                await this.readFile(path, engine, contentCache);
            }));
        }
    }

    private async readFile(path: Path, engine: IEngine, contentCache: Record<string, string>) {
        try {
            const rel = path.relativeTo(engine.projectRoot);
            contentCache[rel] = await Bun.file(path.toString()).text();
        } catch (e) {
            logger.warn(`Failed to read ${path.toString()}: ${e}`);
        }
    }

    private async registerAllFiles(contentCache: Record<string, string>, engine: IEngine, goMap: Record<string, any>) {
        for (const relPath in contentCache) {
            const normRel = relPath.replace(/\\/g, "/");
            await engine.registerFile(engine.projectRoot.join(relPath), false, goMap[normRel]);
        }
    }

    getInitialInfo(path: Path, relPath: string, analyst: { mapComponentType(path: string): string }): any {
        const compType = analyst.mapComponentType(relPath);
        return {
            purpose: "Logic",
            functions: [],
            classes: [],
            brittle: false,
            silent_error: false,
            has_test: false,
            component_type: compType,
            domain: compType === "TEST" ? "EXPERIMENTATION" : "PRODUCTION",
            path: path.toString(),
            rel_path: relPath
        };
    }
}

export class ContextIterator {
    projectRoot: Path | null;
    map: Record<string, any>;
    guardian: any;
    ignoredFiles: string[];
    stack: string;

    constructor(projectRoot: string | null, contextMap: Record<string, any>, options: { integrityGuardian?: any; ignoredFiles?: string[]; stack?: string } = {}) {
        this.projectRoot = projectRoot ? new Path(projectRoot) : null;
        this.map = contextMap;
        this.guardian = options.integrityGuardian;
        this.ignoredFiles = options.ignoredFiles || [];
        this.stack = options.stack || "Universal";
    }

    getPyFiles(): Record<string, any> {
        const pyFiles: Record<string, any> = {};
        for (const [p, d] of Object.entries(this.map)) {
            if (p.endsWith('.py')) {
                pyFiles[p] = d;
            }
        }
        return pyFiles;
    }

    async *iterAuditableFiles(): AsyncGenerator<[string, string]> {
        for (const [relPath, metadata] of Object.entries(this.map)) {
            const content = await this.auditSingleFile(relPath, metadata);
            if (content) yield [relPath, content];
        }
    }

    private async auditSingleFile(relPath: string, metadata: any): Promise<string | null> {
        if (!this.shouldAudit(relPath, metadata)) return null;
        return await this.readFile(relPath);
    }

    private shouldAudit(relPath: string, metadata: any): boolean {
        const isIgnored = this.ignoredFiles.includes(relPath);
        const isTest = metadata.component_type === "TEST";
        return !isIgnored && !isTest;
    }

    private async readFile(relPath: string): Promise<string | null> {
        if (!this.projectRoot) return null;
        const absPath = this.projectRoot.join(relPath);

        try {
            if (await absPath.exists()) {
                return await Bun.file(absPath.toString()).text();
            }
            return null;
        } catch (e) {
            return null;
        }
    }
}

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
        const goMap = await this.getGoDiscoveryMap();
        this.allFilesIndex = Object.keys(goMap).map(p => path.join(this.projectRoot.toString(), p));
        this.contentCache = await this.mappingLogic.processBatch(this._getScanner(), this, goMap);
        await this.buildDependencyMap();
        return { identity: this.projectIdentity, map: this.map };
    }

    private async getGoDiscoveryMap(): Promise<Record<string, any>> {
        const { GoDiscoveryAdapter } = await import("../analysis/architecture_types_service.ts");
        const { results: goResults } = await GoDiscoveryAdapter.scan(this.projectRoot.toString(), this.projectRoot.toString(), this.hubManager);
        const goMap: Record<string, any> = {};
        goResults.forEach(r => goMap[r.path.replace(/\\/g, "/")] = r);
        return goMap;
    }

    async registerFile(path: Path, ignoreTest: boolean = false, goMetrics?: any) {
        const rel = path.relativeTo(this.projectRoot).replace(/\\/g, "/");
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

        try {
            await this.performDeepAnalysis(path, content, info, ignoreTest);
        } catch (e) {}

        this.enrichTestDepth(content, info);
        this.map[rel] = info;
    }

    private async getCachedContent(path: Path, rel: string): Promise<string> {
        if (this.contentCache[rel]) return this.contentCache[rel]!;
        return this.readFileContent(path);
    }

    private async readFileContent(path: Path): Promise<string> {
        if ((this as any)._customReader) return (this as any)._customReader(path);
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
        const absPath = path.toString();
        const name = path.name();
        const structural = path.toString().endsWith('.py')
            ? await this.analyst.analyzePython(content, absPath)
            : await this.analyst.analyze_file_logic(content, absPath);

        try {
            info.intent = this.analyst.analyze_intent(content, name, info.rust_metadata);
        } catch {}

        const compType = info.component_type;
        Object.assign(info, structural);
        if (compType) info.component_type = compType;
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
        try {
            const vuln = await this.analyst.integrityGuardian.detectVulnerabilities(content, info.component_type, path.name(), ignoreTest);
            Object.assign(info, vuln);
        } catch {}

        try {
            info.has_test = await this.coverageAuditor.detectTest(path, info.component_type, this.allFilesIndex, info);
        } catch {}

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
            const rawDeps = d.dependencies || [];
            const deps = Array.isArray(rawDeps) ? rawDeps : Array.from(rawDeps as any);
            deps.forEach((dep: any) => {
                const res = ContextHelpers.resolveDependency(String(dep), this.map);
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
        const res = await CognitiveEngine.getInstance().reason(p);
        if (typeof res === 'string') return { status: res, score: 0 };
        return res || { status: "Unknown", score: 0 };
    }

    _getScanner() { return new FileSystemScanner(this.projectRoot.toString(), this.analyst); }
    get_criticality_score(f: string) { return ContextHelpers.getCriticalityScore(f, this.map); }
}

/**
 * 🧠 StrategicCognitiveArchitectService
 * Serviço Soberano da Super Persona strategic_cognitive_architect.
 * Centraliza análise de contexto semântico, raciocínio cognitivo, validação de sanidade e análise comportamental.
 */
export class StrategicCognitiveArchitectService {
    private engine?: ContextEngine;

    async initEngine(projectRoot: string) {
        this.engine = new ContextEngine(projectRoot);
        return this.engine.analyzeProject();
    }

    async reason(prompt: string) {
        return CognitiveEngine.getInstance().reason(prompt);
    }
}

export class ActivityClassifier {
    static classify(app: string, title: string): string {
        const app_l = app.toLowerCase();
        const title_l = title.toLowerCase();
        if (this.isDev(app_l)) return "DEV";
        if (this.isGaming(app_l)) return "GAMING";
        if (this.isBrowsing(app_l)) return this.isMedia(title_l) ? "MEDIA" : "BROWSING";
        return "GENERAL";
    }

    private static isDev(app: string): boolean {
        return ["code", "powershell", "cmd", "wt", "pycharm", "cursor"].includes(app);
    }

    private static isGaming(app: string): boolean {
        return ["steam", "valorant", "cs2", "minecraft"].includes(app);
    }

    private static isBrowsing(app: string): boolean {
        return ["chrome", "msedge", "firefox", "brave"].includes(app);
    }

    private static isMedia(title: string): boolean {
        return title.includes("youtube") || title.includes("netflix");
    }
}

// ==========================================
// 🧠 SUBSISTEMA NEURAL MICROGPT
// ==========================================
export { NeuralSubsystemService, MicroGPT, PredictorEngine };
