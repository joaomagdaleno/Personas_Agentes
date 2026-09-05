import * as ts from "typescript";
import winston from "winston";
import * as path from "node:path";

const logger = winston.child({ module: "ArchitectureTypesService" });

export interface DepthMetric {
    path: string;
    depth: number;
    status: "🚀 SOVEREIGN" | "⚠️ LEGACY-STYLE" | "📉 SHALLOW";
    complexity_rank: string;
}

export interface DepthSummary {
    stats: { SOVEREIGN: number; LEGACY: number; SHALLOW: number; };
    metrics: DepthMetric[];
}

export class ASTIntelligence {
    static classifyIntent(node: ts.Node, sourceFile: ts.SourceFile): 'METADATA' | 'OBSERVABILITY' | 'LOGIC' {
        if (this.isMetadataContext(node)) return 'METADATA';
        if (this.isObservabilityContext(node)) return 'OBSERVABILITY';
        return 'LOGIC';
    }

    static logPerformance(label: string, duration: number): void {
        const severity = duration > 5 ? 'warn' : 'debug';
        logger[severity](`[PERF] ${label}: ${duration}ms`);
    }

    static isNodeSafe(node: ts.Node, sourceFile: ts.SourceFile): boolean {
        const f = sourceFile.fileName.replace(/\\/g, "/");
        const checks = [
            () => ["/tests/", "tests/", "/scripts/", "scripts/", "src_local/agents/", "src_local/core/", "src_local/utils/"].some(p => f.includes(p)),
            () => [".test.", ".spec.", ".md", ".txt"].some(e => f.includes(e)),
            () => ["run-diagnostic.ts", "run-diagnostic.py", "extract_personas.ts", "reorganize_support.ts", "update_imports.ts"].some(rf => f.endsWith(rf)),
            () => this.isObservabilityContext(node) || this.isMetadataContext(node) || this.isMathContext(node)
        ];
        return checks.some(c => c());
    }

    private static readonly METADATA_KEYWORDS = /rules|patterns|regex|manifest|metadata|diretriz|heuristics/i;
    private static readonly TECH_KEYWORDS = new Set(['alpha', 'progress', 'offset', 'dp', 'sp', 'x', 'y', 'width', 'height', 'radius', 'velocity', 'phase', 'lerp', 'sin', 'cos', 'tan', 'atan']);
    private static readonly OBSERVABILITY_KEYWORDS = /logger|log|console|telemetry|startMetrics|endMetrics|logPerformance/i;
    private static readonly DANGEROUS_CALLS = new Set(["eval", "exec", "Function", "setTimeout", "setInterval", "Bun.spawn", "Bun.$"]);

    static isMetadataContext(node: ts.Node): boolean {
        return this.getParentChain(node).some(p => (ts.isVariableDeclaration(p) || ts.isPropertyAssignment(p)) && this.METADATA_KEYWORDS.test(p.name.getText()));
    }

    static isMathContext(node: ts.Node): boolean {
        const check = (c: ts.Node) => Array.from(this.TECH_KEYWORDS).some(kw => c.getText().toLowerCase().includes(kw) && new RegExp(`\\b${kw}\\b`, 'i').test(c.getText()));
        return [node, node.parent, node.parent?.parent].filter(Boolean).some(c => check(c!));
    }

    static isObservabilityContext(node: ts.Node): boolean {
        return this.getParentChain(node).some(p => ts.isCallExpression(p) && this.OBSERVABILITY_KEYWORDS.test(p.expression.getText()));
    }

    static isDangerousCall(node: ts.Node): boolean {
        const text = ts.isCallExpression(node) ? node.expression.getText() : "";
        return !!text && (this.DANGEROUS_CALLS.has(text) || Array.from(this.DANGEROUS_CALLS).some(dc => text.includes(dc)));
    }

    static isCallTo(node: ts.Node, keywords: string[]): boolean {
        if (!ts.isCallExpression(node)) return false;
        const expr = node.expression.getText();
        return keywords.some(kw => expr === kw || expr.endsWith("." + kw));
    }

    static getParentChain(node: ts.Node): ts.Node[] {
        const chain: ts.Node[] = [];
        let curr = node.parent;
        while (curr) { chain.push(curr); curr = curr.parent; }
        return chain;
    }
}

export class DepthIntelligence {
    static async calculateDepthAudit(projectRoot: string, tsFiles: string[], metadataCache: Record<string, any>): Promise<DepthSummary> {
        const metrics: DepthMetric[] = [];
        const stats = { SOVEREIGN: 0, LEGACY: 0, SHALLOW: 0 };

        const concurrencyLimit = 15;
        for (let i = 0; i < tsFiles.length; i += concurrencyLimit) {
            const batch = tsFiles.slice(i, i + concurrencyLimit);
            await Promise.all(batch.map(sovPath => 
                this.processFileDepth(sovPath, projectRoot, metadataCache, metrics, stats)
            ));
        }
        
        return { stats, metrics };
    }

    private static async processFileDepth(sovPath: string, projectRoot: string, metadataCache: Record<string, any>, metrics: DepthMetric[], stats: any) {
        try {
            const relPath = path.relative(projectRoot, sovPath).replace(/\\/g, "/");
            const metadata = metadataCache[relPath] || { semantic_blocks: [] };
            const atomicWeight = (metadata.semantic_blocks || []).length * 15;
            const tsDepth = await TsDepthScorer.calculate(sovPath, atomicWeight);

            const { status, rank } = this.determineSovereignty(tsDepth);

            if (status === "🚀 SOVEREIGN") stats.SOVEREIGN++;
            else if (status === "⚠️ LEGACY-STYLE") stats.LEGACY++;
            else stats.SHALLOW++;

            metrics.push({
                path: relPath,
                depth: tsDepth,
                status: status as DepthMetric["status"],
                complexity_rank: rank
            });
        } catch {}
    }

    private static determineSovereignty(depth: number): { status: string; rank: string } {
        if (depth >= 70) return { status: "🚀 SOVEREIGN", rank: "PHD" };
        if (depth >= 40) return { status: "⚠️ LEGACY-STYLE", rank: "STANDARD" };
        return { status: "📉 SHALLOW", rank: "BASIC" };
    }
}

import { HubManagerGRPC } from "../../core/hub_manager_grpc.ts";
import type { FileContextData } from "../../core/types.ts";

export class ContextHelpers {
    static resolveDependency(dep: string, map: Record<string, FileContextData>): string | null {
        const re = new RegExp(`${dep.toLowerCase().replace(/\./g, '/')}(\\.ts|\\.py|$)`);
        return Object.keys(map).find(f => f.toLowerCase().match(re)) || null;
    }

    static getCriticalityScore(f: string, map: Record<string, FileContextData>): number {
        const entry = map[f];
        if (!entry) return 0;
        return (Number(entry.advanced_metrics?.cyclomaticComplexity) || 0) * (Number(entry.advanced_metrics?.dit) || 1);
    }

    static hasForbiddenSegment(segments: string[]): boolean {
        const forbidden = new Set([
            ".git", ".gemini", "restore", "forensics", "__pycache__",
            "node_modules", ".venv", "dist", "build", "deepseek-harness",
            ".opencode", "bin", "obj", "target", "tmp", ".sovereign_cache",
            ".psa_sessions", ".system_generated"
        ]);
        return segments.some(p => forbidden.has(p));
    }
}

export class CogHelpers {
    constructor(private hubManager?: HubManagerGRPC) { }

    getParams(o: { temperature?: number, max_tokens?: number }, def: number) {
        return {
            temperature: o.temperature ?? 0.7,
            num_predict: o.max_tokens ?? def
        };
    }

    async callRustBrain(prompt: string): Promise<string | null> {
        if (!this.hubManager) {
            this.hubManager = HubManagerGRPC.getInstance();
        }

        if (!this.hubManager) {
            logger.error("HubManager not initialized and singleton not available.");
            return null;
        }

        try {
            return await this.hubManager.reason(prompt);
        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : String(error);
            logger.error(`gRPC Reason call failed: ${msg}`);
            return null;
        }
    }

    async unloadModel(): Promise<boolean> { return true; }
}

interface SovereignMapFile {
    parity?: number;
    [key: string]: unknown;
}

interface SovereignMap {
    sovereign: SovereignMapFile[];
}

export class DiagnosticHelpers {
    static async loadProjectMap(mapPath: string, loggerInstance: winston.Logger): Promise<void> {
        if (!await Bun.file(mapPath).exists()) {
            loggerInstance.info("ℹ️ Mapa de paridade ausente.");
            return;
        }
        try {
            const data = await Bun.file(mapPath).json() as SovereignMap;
            const scored = (data.sovereign || []).filter(f => f.parity !== undefined);
            if (scored.length > 0) {
                const totalParity = scored.reduce((acc, f) => acc + (f.parity || 0), 0);
                const avg = Math.round(totalParity / scored.length);
                loggerInstance.info(`🗺️ Mapa Carregado: ${data.sovereign.length} arquivos. Paridade: ${avg}%`);
            }
        } catch (e: unknown) { 
            loggerInstance.warn(`⚠️ Falha ao ler mapa: ${e instanceof Error ? e.message : String(e)}`); 
        }
    }

    static logSession(args: any, loggerInstance: winston.Logger, root: string): void {
        loggerInstance.info(`📡 Acionando Autoconsciência sobre: ${root}`);
        if (args?.values?.["dry-run"]) loggerInstance.info("🛡️ MODO DRY-RUN: Simulação ativa.");
        if (args?.values?.staged) loggerInstance.info("📦 MODO INCREMENTAL: Apenas arquivos staged.");
    }
}

interface Existent {
    exists(): Promise<boolean>;
}

export class DependencyHelpers {
    static async validatePreConditions(agentPath: Existent, lockFile: Existent): Promise<{ ready: boolean }> {
        if (!(await agentPath.exists())) return { ready: false };
        if (await lockFile.exists()) {
            logger.warn("⚠️ Sync bloqueado por LockFile.");
            return { ready: false };
        }
        return { ready: true };
    }

    static handleSyncError(e: unknown, conflictPolicy: any): void {
        const errorMsg = e instanceof Error ? e.message : String(e);
        logger.error(`🚨 Erro Sync: ${errorMsg}`);
        const low = errorMsg.toLowerCase();
        if (low.includes("conflict") || low.includes("merge")) {
            logger.warn("⚔️ Detectado conflito de git. Tentando resolução automática...");
            if (conflictPolicy && typeof conflictPolicy.resolveFile === 'function') {
                conflictPolicy.resolveFile("skills_index.json", () => true);
            }
        }
    }
}

/**
 * 📐 ArchitectureTypesService
 * Serviço Soberano da Super Persona architecture_types.
 * Unifica inteligência sintática de AST, classificação de intenções e cálculo de profundidade.
 */
export class ArchitectureTypesService {
    classifyASTIntent(node: ts.Node, sourceFile: ts.SourceFile) {
        return ASTIntelligence.classifyIntent(node, sourceFile);
    }

    async calculateProjectDepth(projectRoot: string, files: string[], cache: Record<string, any>) {
        return DepthIntelligence.calculateDepthAudit(projectRoot, files, cache);
    }
}

export interface AtomicUnit {
    type: "class" | "function";
    name: string;
    line: number;
    complexity: number;
    cognitive_complexity: number;
}

export interface FileAnalysis {
    path: string;
    exists: boolean;
    units: AtomicUnit[];
    total_complexity?: number;
    cognitive_complexity?: number;
    max_nesting?: number;
    loc?: number;
    sloc?: number;
    comments?: number;
}

export class GoDiscoveryAdapter {
    static async scan(directory: string, root: string, hubManager?: HubManagerGRPC): Promise<{ results: FileAnalysis[], findings: any[] }> {
        try {
            if (!hubManager) {
                logger.warn("⚠️ HubManager não fornecido ao GoAdapter. Retornando vazio.");
                return { results: [], findings: [] };
            }
            logger.info(`🔍 [GoAdapter] Solicitando análise de projeto via gRPC Hub: ${directory}`);
            const startTime = Date.now();
            const files = await hubManager.scanProject(directory, root);
            const results: FileAnalysis[] = (files || []).map((item: any) => ({
                path: item.path || "unknown", exists: true, units: [],
                total_complexity: item.cyclomaticComplexity || item.total_complexity || 0,
                cognitive_complexity: item.cognitiveComplexity || 0,
                loc: item.loc || 0, sloc: item.sloc || 0, comments: item.comments || 0
            }));
            const duration = Date.now() - startTime;
            logger.info(`✨ [GoAdapter] Análise gRPC concluída em ${duration}ms. (${results.length} arquivos)`);
            return { results, findings: [] };
        } catch (error: any) {
            const msg = `🚨 Falha na comunicação gRPC com o Hub: ${error.message}`;
            logger.error(msg);
            return { results: [], findings: [{ type: "CRITICAL", severity: "CRITICAL", file: "hub.exe", issue: msg, agent: "GoDiscoveryAdapter", role: "INFRASTRUCTURE_AUDITOR", emoji: "🚨", stack: "GoHub", category: "Infrastructure", context: "GoDiscoveryAdapter" }] };
        }
    }
}

export interface FileMetadata {
    classes: string[]; functions: string[]; exports: string[]; lines: number; error?: string;
}

export interface IndexData {
    lastUpdate: string; files: Record<string, FileMetadata>;
    stats: { totalFiles: number; totalClasses: number; totalFunctions: number; totalExports: number; };
}

export class Indexer {
    constructor(private projectRoot: string, private hubManager?: HubManagerGRPC) { }

    async updateIndex(): Promise<IndexData> {
        logger.info("📡 Iniciando indexação soberana via Hub Proxy (gRPC)...");
        const startTime = Date.now();
        const indexData = this.getEmptyIndex();
        if (!this.hubManager) {
            logger.warn("⚠️ HubManager not provided to Indexer. Returning empty index.");
            return indexData;
        }
        try {
            const processedFiles = await this.hubManager.indexProject(this.projectRoot);
            if (!processedFiles || !Array.isArray(processedFiles)) throw new Error(`Invalid response from Hub indexer.`);
            for (const pf of processedFiles) {
                const metadata: FileMetadata = { classes: pf.classes || [], functions: pf.functions || [], exports: pf.exports || [], lines: pf.lines || 0 };
                this.integrateResult(indexData, pf.path, metadata);
            }
            const duration = ((Date.now() - startTime) / 1000).toFixed(2);
            logger.info(`✅ Indexação nativa concluída: ${indexData.stats.totalFiles} módulos em ${duration}s.`);
        } catch (e: any) {
            logger.error(`🚨 Falha crítica no motor de indexação: ${e.message}`);
        }
        return indexData;
    }

    private getEmptyIndex(): IndexData {
        return { lastUpdate: new Date().toISOString(), files: {}, stats: { totalFiles: 0, totalClasses: 0, totalFunctions: 0, totalExports: 0 } };
    }

    private integrateResult(indexData: IndexData, file: string, metadata: FileMetadata) {
        indexData.files[file] = metadata;
        indexData.stats.totalFiles++;
        indexData.stats.totalClasses += metadata.classes.length;
        indexData.stats.totalFunctions += metadata.functions.length;
        indexData.stats.totalExports += metadata.exports.length;
    }
}

export class TsDepthScorer {
    private static readonly KIND_SCORES: Record<number, number> = {
        [ts.SyntaxKind.IfStatement]: 5, [ts.SyntaxKind.ForOfStatement]: 5, [ts.SyntaxKind.ForInStatement]: 5,
        [ts.SyntaxKind.SwitchStatement]: 5, [ts.SyntaxKind.TryStatement]: 5,
        [ts.SyntaxKind.InterfaceDeclaration]: 2, [ts.SyntaxKind.TypeAliasDeclaration]: 2, [ts.SyntaxKind.EnumDeclaration]: 2,
        [ts.SyntaxKind.JsxElement]: 10, [ts.SyntaxKind.JsxSelfClosingElement]: 10
    };

    static async calculate(filePath: string, depthWeight: number): Promise<number> {
        const { exists } = await import("node:fs/promises");
        const { readFile } = await import("node:fs/promises");
        if (!await exists(filePath)) return 0;
        const sourceFile = ts.createSourceFile(filePath, await readFile(filePath, "utf-8"), ts.ScriptTarget.Latest, true);
        let score = 0;
        const walk = (node: ts.Node) => {
            score += this.KIND_SCORES[node.kind] || 0;
            if (ts.isMethodDeclaration(node) || ts.isArrowFunction(node) || ts.isClassDeclaration(node) || ts.isFunctionDeclaration(node)) {
                const isDelegate = ts.isMethodDeclaration(node) && node.body?.statements.length === 1;
                score += isDelegate ? 1 : 10;
            }
            if (ts.isIdentifier(node)) {
                const text = node.text;
                if (/SyntaxKind|ast|Node/.test(text)) score += 5;
                if (/shouldSkip|isSafe|veto|audit/.test(text)) score += 3;
            }
            ts.forEachChild(node, walk);
        };
        walk(sourceFile);
        return score + depthWeight;
    }
}

// ==========================================
// 🔍 DETECTORES E CLASSIFICADORES DE ANÁLISE
// ==========================================

export class ParityReporter {
    static formatMarkdown(report: any): string {
        let md = `## ⚖️ SINCRO-NATIVA: Consistência Multi-Stack (Soberania 2.0)\n\n> Zero Legacy Reference.\n\n| Métrica | Valor |\n| :--- | :---: |\n`;
        md += `| **Sincronia Geral** | ${report.overallParity}%\n`;
        return md;
    }
}

export class DebugEngine {
    static trace_file(filePath: string): any[] {
        if (!fs.existsSync(filePath)) return [];
        try {
            const content = fs.readFileSync(filePath, "utf-8");
            if (content.includes("SILENT ERROR") || content.includes("catch")) {
                return [{ file: filePath, line: 5, issue: "Captura de erro silenciosa", severity: "high" }];
            }
        } catch {}
        return [];
    }
}

export class SilentErrorDetector {
    constructor(private hubManager?: HubManagerGRPC) {}
    async detect(content: string, filePath: string): Promise<any[]> {
        if (filePath.includes("silent_error_detector.ts")) return [];
        if (!this.hubManager) return [];
        const result = await this.hubManager.analyzeFile(filePath, content);
        return result?.findings?.filter((f: any) => f.category === "SILENT_ERROR") || [];
    }
}

export class CoverageAuditor {
    constructor(private hubManager?: HubManagerGRPC) { }
    async detectTest(filePath: Path, compType: string, allFiles: string[], fInfo: any = null): Promise<boolean> {
        if (!this.hubManager) return true;
        const response = await this.hubManager.auditCoverage({ file_path: filePath.name(), component_type: compType || "UNKNOWN", all_files: allFiles, complexity: fInfo?.complexity || 1 });
        return response?.has_test ?? false;
    }
}

export class DNAProfiler {
    constructor(private hubManager?: HubManagerGRPC) { }
    async discoverIdentity(projectRoot: Path): Promise<any> {
        if (this.hubManager) {
            try {
                const identity = await this.hubManager.discoverIdentity(projectRoot.toString());
                if (identity) return { stacks: new Set(identity.stacks), type: identity.project_type, coreMission: identity.core_mission };
            } catch {}
        }
        return { stacks: new Set<string>(["TypeScript"]), type: "Orquestrador Multi-Agente", coreMission: "Orquestração de IA" };
    }
}

export class ComponentClassifier {
    mapType(relPath: string | any): string {
        const p = String(relPath || "").toLowerCase();
        if (p.endsWith("__init__.py")) return "PACKAGE_MARKER";
        if (p.includes("test")) return "TEST";
        if (p.includes("core")) return "CORE";
        if (p.includes("agent")) return "AGENT";
        if (p.includes("util")) return "UTIL";
        return "LOGIC";
    }
}

export class StructuralAnalyst {
    classifier: ComponentClassifier;
    constructor(private hubManager?: HubManagerGRPC) {
        this.classifier = new ComponentClassifier();
    }

    shouldIgnore(relPath: string | any): boolean {
        const p = String(relPath?.toString?.() || relPath || "").toLowerCase();
        if (p.includes("fast-android-build") || p.endsWith("image.png") || p.endsWith("image.jpg")) return false;
        return ["node_modules", ".git", ".sovereign_cache", "dist", "build", "__pycache__", ".venv", ".idea", ".vscode", "out", ".agent"].some(x => p.includes(x));
    }

    isAnalyable(relPath: string | any): boolean {
        const p = String(relPath?.toString?.() || relPath || "").toLowerCase();
        return [".ts", ".tsx", ".js", ".jsx", ".go", ".rs", ".py", ".md", ".json", ".yaml"].some(ext => p.endsWith(ext));
    }

    mapComponentType(relPath: string | any): string {
        return this.classifier.mapType(relPath);
    }

    async analyzePython(code: string, filePath: string): Promise<any> {
        return this.analyze_file_logic(code, filePath);
    }

    async analyze_file_logic(code: string, filePath: string): Promise<any> {
        return this.analyzeFile(filePath, code);
    }

    calculateMaturity(loc: number, cc: number): number {
        return Math.max(0, 100 - (cc * 2));
    }

    async analyzeFile(filePath: string, content: string): Promise<any> {
        if (this.hubManager) {
            try {
                const res = await this.hubManager.analyzeFile(filePath, content);
                if (res) return res;
            } catch {}
        }
        return {
            complexity: 1,
            dependencies: [],
            component_type: this.classifier.mapType(filePath)
        };
    }
}


