import winston from "winston";
import { Database } from "bun:sqlite";
import { dlopen, FFIType, suffix } from "bun:ffi";
import * as path from "node:path";
import * as fs from "node:fs";
import { readdir } from "node:fs/promises";
import { join, dirname } from "node:path";
import { Path } from "../../core/path_utils.ts";
import { MemoryPersistence } from "./memory_persistence.ts";
import { HubManagerGRPC } from "../../core/hub_manager_grpc.ts";
import { DatabaseHub } from "../../core/database_hub.ts";
import { ForbiddenPolicy } from "../security/security_cloud_guardian_service.ts";
import { GitClient } from "../automation/sync_devops_architect_service.ts";

const logger = winston.child({ module: "ResilienceHealingArchitectService" });

export class StabilityLedger {
    projectRoot: Path;
    persistence: MemoryPersistence;
    ledger: Record<string, any>;

    constructor(projectRoot: string) {
        this.projectRoot = new Path(projectRoot);
        const storagePath = this.projectRoot.join(".gemini", "stability_ledger.json");

        this.persistence = new MemoryPersistence(storagePath);
        this.ledger = this.persistence.loadLedger();
    }

    async sync() {
        logger.info("💾 [Ledger] Sincronizando livro de estabilidade...");
        this.persistence.saveLedger(this.ledger);
    }

    update(auditResults: any[], contextMap: Record<string, any> = {}): Record<string, any> {
        try {
            this.performMaintenance();
            const currentErrorFiles = this.processAuditResults(auditResults, contextMap);
            this.detectHealedFiles(currentErrorFiles);

            this.persistence.saveLedger(this.ledger);
            return this.ledger;
        } catch (e: any) {
            logger.error(`🚨 Falha ao atualizar livro de estabilidade: ${e.message}`);
            return this.ledger;
        }
    }

    private performMaintenance() {
        const isInternal = this.projectRoot.toString().includes("Personas_Agentes");
        if (!isInternal && this.ledger[".agent/skills"]) {
            delete this.ledger[".agent/skills"];
        }
    }

    private processAuditResults(results: any[], contextMap: any): Set<string> {
        const currentErrorFiles = new Set<string>();
        results.forEach(issue => {
            const file = this.extractFileName(issue);
            currentErrorFiles.add(file);
            this.updateFileStatus(file, contextMap);
        });
        return currentErrorFiles;
    }

    private extractFileName(issue: any): string {
        if (typeof issue === 'object' && issue !== null && issue.file) {
            return String(issue.file).replace(/\\/g, "/");
        }
        return "Strategic/DNA";
    }

    private updateFileStatus(file: string, contextMap: Record<string, any>) {
        if (this.tryMarkReference(file, contextMap)) return;

        const entry = this.ledger[file] || { occurrences: 0, history: [], status: "UNSTABLE" };
        entry.occurrences += 1;
        entry.history.push(new Date().toISOString());

        if (entry.status !== "REFERENCE") {
            entry.status = "UNSTABLE";
        }

        this.ledger[file] = entry;
    }

    private tryMarkReference(file: string, contextMap: Record<string, any>): boolean {
        if (contextMap[file]?.is_gold_standard) {
            this.ledger[file] ||= { status: "REFERENCE", history: ["Identificado como Gold Standard"] };
            return true;
        }
        return false;
    }

    private detectHealedFiles(currentErrors: Set<string>) {
        Object.keys(this.ledger).forEach(file => {
            if (this.isHealable(file, currentErrors)) {
                this.markAsHealed(file);
            }
        });
    }

    private markAsHealed(file: string) {
        logger.info(`✨ [Memória] Cura confirmada: ${file}`);
        this.ledger[file].status = "HEALED";
        this.ledger[file].occurrences = 0;
    }

    private isHealable(file: string, currentErrors: Set<string>): boolean {
        const entry = this.ledger[file];
        if (file === "Strategic/DNA" || entry.status === "REFERENCE") return false;
        return !currentErrors.has(file) && entry.status !== "HEALED";
    }

    clear() {
        this.ledger = this.filterLedgerByStatus("REFERENCE");
        this.persistence.saveLedger(this.ledger);
        logger.info("🧹 [StabilityLedger] Memória de instabilidade resetada.");
    }

    private filterLedgerByStatus(status: string): Record<string, any> {
        return Object.fromEntries(
            Object.entries(this.ledger).filter(([_, v]) => v.status === status)
        );
    }

    getFileData(filePath: string): any {
        return this.persistence.getFileMetadata(this.ledger, filePath);
    }

    registerDisparity(disparity: { source: string, target: string, discrepancies: string[], severity: string }) {
        const file = disparity.source.replace(/\\/g, "/");
        const entry = this.ledger[file] || { occurrences: 0, history: [], status: "UNSTABLE" };
        
        entry.status = "DISPARITY";
        entry.occurrences += 1;
        entry.history.push(`[PARITY ERROR] Disparidade com ${disparity.target}: ${disparity.discrepancies.join("; ")}`);
        entry.meta = { ...entry.meta, lastSiblingDisparity: disparity.target, severity: disparity.severity };

        this.ledger[file] = entry;
        this.persistence.saveLedger(this.ledger);
        logger.warn(`⚖️ [Ledger] Disparidade registrada para ${file}`);
    }
}

export class MemoryEngine {
    private dbHub: DatabaseHub;
    private thinkingDepth: number = 7;

    constructor(projectRoot: string, private hubManager?: HubManagerGRPC) {
        this.dbHub = DatabaseHub.getInstance(projectRoot);
    }

    setDepth(level: number) {
        this.thinkingDepth = level;
        logger.info(`🧪 [Memory] Profundidade de pensamento ajustada para: ${level}`);
    }

    rememberFinding(finding: any) {
        try {
            const file = finding.file || "unknown";
            const message = finding.issue || finding.message;
            const severity = finding.severity || "INFO";

            this.dbHub.run(
                "INSERT INTO ai_insights (mode, insight, impact_level) VALUES (?, ?, ?)",
                ["MEMORY", `Finding in ${file}: ${message}`, severity]
            );
            logger.debug(`🧠 [Memory] Memorizado: ${file} (${finding.type || "GENERIC"})`);
        } catch (e) {
            logger.error(`❌ Erro ao memorizar achado: ${e}`);
        }
    }

    public async syncProjectMemory(contextMap: Record<string, { content: string, component_type: string }>): Promise<void> {
        logger.info("🧠 [Memory] Sincronizando memória estrutural...");

        const tasks: Promise<void>[] = [];
        for (const [relPath, data] of Object.entries(contextMap)) {
            tasks.push(this.syncFileMemory(relPath, data.content));
        }
        await Promise.all(tasks);
    }

    private async syncFileMemory(relPath: string, content: string): Promise<void> {
        if (!content) return;

        const hash = Bun.hash(content).toString();
        if (this.isMemoryUpToDate(relPath, hash)) return;

        await this.updateFileMemory(relPath, content, hash);
    }

    private isMemoryUpToDate(relPath: string, hash: string): boolean {
        const query = "SELECT insight FROM ai_insights WHERE mode = 'HASH' AND insight LIKE ?";
        const existing = this.dbHub.query(query).get(`${relPath}:%`);
        return !!existing && (existing as any).insight === `${relPath}:${hash}`;
    }

    private async updateFileMemory(relPath: string, content: string, hash: string): Promise<void> {
        let anchors: string[] = [];
        
        if (this.hubManager) {
            try {
                const analysis = await this.hubManager.analyzeFile(relPath, content);
                if (analysis && analysis.symbols) {
                    anchors = analysis.symbols.map((s: any) => `${s.kind}:${s.name}`);
                }
            } catch (e) {
                logger.error(`❌ [Memory] Erro ao extrair âncoras via Hub para ${relPath}: ${e}`);
            }
        }

        if (anchors.length === 0) {
            logger.debug(`⚠️ [Memory] Sem âncoras extraídas para ${relPath}.`);
        }

        this.dbHub.run("DELETE FROM ai_insights WHERE mode = 'HASH' AND insight LIKE ?", [`${relPath}:%`]);
        this.dbHub.run(
            "INSERT INTO ai_insights (mode, insight, impact_level) VALUES (?, ?, ?)",
            ["HASH", `${relPath}:${hash}`, "SYSTEM"]
        );

        if (anchors.length > 0) {
            this.dbHub.run(
                "INSERT INTO ai_insights (mode, insight, impact_level) VALUES (?, ?, ?)",
                ["RAG", `Anchors for ${relPath}: ${anchors.join(", ")}`, "STRATEGIC"]
            );
        }
    }

    searchSimilar(query: string): any[] {
        try {
            const sql = "SELECT * FROM ai_insights WHERE mode IN ('MEMORY', 'RAG') AND insight LIKE ? ORDER BY timestamp DESC LIMIT 5";
            return this.dbHub.query(sql).all(`%${query}%`);
        } catch (e) {
            logger.error(`❌ Erro na busca de memória: ${e}`);
            return [];
        }
    }

    prune() {
        try {
            this.dbHub.run("DELETE FROM ai_insights WHERE mode != 'HASH' AND timestamp < datetime('now', '-30 days')");
        } catch (e) {
            logger.error(`❌ Erro ao podar memória: ${e}`);
        }
    }
}

export class NativeFFIBridge {
    private static instance: NativeFFIBridge | null = null;
    private lib: any = null;
    private isAvailable: boolean = false;
    private zigLib: any = null;
    private isZigAvailable: boolean = false;

    private constructor(projectRoot: string = process.cwd()) {
        this.initLibrary(projectRoot);
    }

    public static getInstance(projectRoot?: string): NativeFFIBridge {
        if (!NativeFFIBridge.instance) {
            NativeFFIBridge.instance = new NativeFFIBridge(projectRoot);
        }
        return NativeFFIBridge.instance;
    }

    private initLibrary(projectRoot: string) {
        try {
            const libName = `analyzer_lib.${suffix}`;
            const searchPaths = [
                path.join(projectRoot, "src_native", "analyzer", "target", "release", libName),
                path.join(projectRoot, "src_native", "analyzer", "target", "debug", libName),
                path.join(projectRoot, "bin", libName)
            ];

            const libPath = searchPaths.find(p => fs.existsSync(p));

            if (libPath) {
                this.lib = dlopen(libPath, {
                    calculate_complexity: {
                        args: [FFIType.cstring],
                        returns: FFIType.i32
                    },
                    fast_hash: {
                        args: [FFIType.cstring],
                        returns: FFIType.u64
                    }
                });
                this.isAvailable = true;
                logger.info(`⚡ [Bun:FFI] Biblioteca nativa carregada com sucesso: ${libPath}`);
            } else {
                logger.info("ℹ️ [Bun:FFI] Biblioteca nativa não encontrada em disco. Usando fallback estático TS.");
            }
        } catch (err: any) {
            logger.warn(`⚠️ [Bun:FFI] Não foi possível inicializar FFI nativo: ${err.message}. Ativando modo fallback.`);
            this.isAvailable = false;
        }

        try {
            const zigLibName = `libzig_analyzer.so`;
            const zigSearchPaths = [
                path.join(projectRoot, "src_native", "zig_analyzer", zigLibName),
                path.join(projectRoot, "bin", zigLibName)
            ];

            const zigLibPath = zigSearchPaths.find(p => fs.existsSync(p));

            if (zigLibPath) {
                this.zigLib = dlopen(zigLibPath, {
                    calculate_entropy: {
                        args: [FFIType.cstring, FFIType.u64],
                        returns: FFIType.f64
                    },
                    check_unsafe_patterns: {
                        args: [FFIType.cstring, FFIType.u64],
                        returns: FFIType.bool
                    }
                });
                this.isZigAvailable = true;
                logger.info(`⚡ [Bun:FFI] Biblioteca nativa ZIG carregada com sucesso: ${zigLibPath}`);
            } else {
                logger.info("ℹ️ [Bun:FFI] Biblioteca nativa ZIG não encontrada em disco. Usando fallback estático TS.");
            }
        } catch (err: any) {
            logger.warn(`⚠️ [Bun:FFI] Não foi possível inicializar FFI nativo ZIG: ${err.message}. Ativando modo fallback.`);
            this.isZigAvailable = false;
        }
    }

    public isNativeAvailable(): boolean {
        return this.isAvailable;
    }

    public isZigNativeAvailable(): boolean {
        return this.isZigAvailable;
    }

    public calculateComplexityNative(codeContent: string): number {
        if (!this.isAvailable || !this.lib) {
            const keywords = ["if ", "if(", "for ", "for(", "while ", "while(", "catch ", "catch(", "case "];
            let count = 1;
            for (const kw of keywords) {
                let idx = -1;
                while ((idx = codeContent.indexOf(kw, idx + 1)) !== -1) count++;
            }
            return count;
        }
        try {
            const buffer = Buffer.from(codeContent + "\0", "utf-8");
            return this.lib.symbols.calculate_complexity(buffer);
        } catch (e: any) {
            logger.error(`❌ [Bun:FFI] Erro na execução FFI (complexity): ${e.message}`);
            return 1;
        }
    }

    public fastHashNative(codeContent: string): bigint {
        if (!this.isAvailable || !this.lib) {
            let hasher = 0xcbf29ce484222325n;
            const encoder = new TextEncoder();
            const bytes = encoder.encode(codeContent);
            for (const b of bytes) {
                hasher ^= BigInt(b);
                hasher = (hasher * 0x100000001b3n) & 0xFFFFFFFFFFFFFFFFn;
            }
            return hasher;
        }
        try {
            const buffer = Buffer.from(codeContent + "\0", "utf-8");
            return this.lib.symbols.fast_hash(buffer);
        } catch (e: any) {
            logger.error(`❌ [Bun:FFI] Erro na execução FFI (hash): ${e.message}`);
            return 0n;
        }
    }

    public calculateEntropy(codeContent: string): number {
        if (!this.isZigAvailable || !this.zigLib) {
            if (codeContent.length === 0) return 0.0;
            const counts: Record<string, number> = {};
            for (let i = 0; i < codeContent.length; i++) {
                const char = codeContent[i];
                counts[char] = (counts[char] || 0) + 1;
            }
            let entropy = 0;
            const len = codeContent.length;
            for (const char in counts) {
                const p = counts[char] / len;
                entropy -= p * Math.log2(p);
            }
            return entropy;
        }
        try {
            const buffer = Buffer.from(codeContent, "utf-8");
            return this.zigLib.symbols.calculate_entropy(buffer, BigInt(buffer.length));
        } catch (e: any) {
            logger.error(`❌ [Bun:FFI] Erro na execução FFI Zig (entropy): ${e.message}`);
            return 0.0;
        }
    }

    public checkUnsafePatterns(codeContent: string): boolean {
        if (!this.isZigAvailable || !this.zigLib) {
            const patterns = ["eval(", "exec(", "system(", "shell=True", "catch unreachable", "except: pass"];
            return patterns.some(p => codeContent.includes(p));
        }
        try {
            const buffer = Buffer.from(codeContent, "utf-8");
            return this.zigLib.symbols.check_unsafe_patterns(buffer, BigInt(buffer.length));
        } catch (e: any) {
            logger.error(`❌ [Bun:FFI] Erro na execução FFI Zig (patterns): ${e.message}`);
            return false;
        }
    }

    public close() {
        if (this.lib && typeof this.lib.close === "function") {
            this.lib.close();
            this.lib = null;
            this.isAvailable = false;
            logger.info("🔌 [Bun:FFI] Biblioteca nativa descarregada da memória.");
        }
        if (this.zigLib && typeof this.zigLib.close === "function") {
            this.zigLib.close();
            this.zigLib = null;
            this.isZigAvailable = false;
            logger.info("🔌 [Bun:FFI] Biblioteca nativa ZIG descarregada da memória.");
        }
    }

    public [Symbol.dispose](): void {
        this.close();
    }

    public async [Symbol.asyncDispose](): Promise<void> {
        this.close();
    }
}

export class FileSystemScanner {
    root: Path;
    analyst: any;

    constructor(root: string, analyst: any) {
        this.root = new Path(root);
        this.analyst = analyst;
        logger.debug(`FileSystemScanner initialized for root: ${this.root.toString()}`);
    }

    async scanAllFilenames(): Promise<string[]> {
        const files: string[] = [];
        await this.walkFiles(this.root.toString(), files);
        return files;
    }

    private async walkFiles(dir: string, files: string[]) {
        if (ForbiddenPolicy.isForbiddenDir(dir)) return;

        const entries = await readdir(dir, { withFileTypes: true });
        for (const entry of entries) {
            await this.processEntry(dir, entry, files);
        }
    }

    private async processEntry(dir: string, entry: any, files: string[]) {
        const res = join(dir, entry.name);
        if (entry.isDirectory()) {
            await this.walkFiles(res, files);
        } else {
            files.push(entry.name.toLowerCase());
        }
    }

    async *getAnalyzableFiles(): AsyncGenerator<Path> {
        const seen = new Set<string>();
        const generator = this._walkAndYield(this.root.toString());

        for await (const pathStr of generator) {
            const path = new Path(pathStr);
            if (!seen.has(pathStr) && !(await this.shouldSkip(path))) {
                seen.add(pathStr);
                yield path;
            }
        }
    }

    private async * _walkAndYield(dir: string): AsyncGenerator<string> {
        if (ForbiddenPolicy.isForbiddenDir(dir)) return;

        const entries = await readdir(dir, { withFileTypes: true });
        for (const entry of entries) {
            yield* this._processYieldEntry(dir, entry);
        }
    }

    private async * _processYieldEntry(dir: string, entry: any): AsyncGenerator<string> {
        const res = join(dir, entry.name);
        if (entry.isDirectory()) {
            yield* this._walkAndYield(res);
        } else {
            yield res;
        }
    }

    async shouldSkip(path: Path): Promise<boolean> {
        if (!(await path.isFile())) return true;

        const pathStr = path.toString().replace(/\\/g, "/").toLowerCase();
        return this.isPathForbiddenOrIgnored(path, pathStr);
    }

    private isPathForbiddenOrIgnored(path: Path, pathStr: string): boolean {
        if (ForbiddenPolicy.isForbiddenDir(dirname(pathStr))) return true;
        if (this.isAgentRelated(pathStr)) return true;
        if (this.isIgnoredByAnalyst(path)) return true;
        return !this.analyst.isAnalyable(path);
    }

    private isAgentRelated(pathStr: string): boolean {
        return pathStr.includes("/.agent/") && !pathStr.includes("fast-android-build");
    }

    private isIgnoredByAnalyst(path: Path): boolean {
        const pathStr = path.toString().replace(/\\/g, "/").toLowerCase();
        return !pathStr.includes("src_local") && this.analyst.shouldIgnore(path);
    }
}

export interface TopologyFile {
    path: string;
    name: string;
    extension: string;
    category: "Agent" | "Core" | "Util" | "Script" | "Native" | "Unknown";
    size: number;
    stack?: "TypeScript" | "Python" | "Go" | "Kotlin" | "Flutter" | "Dart" | "Zig";
}

export interface TopologyMap {
    timestamp: string;
    sovereign: TopologyFile[];
    shadow: TopologyFile[];
    scripts: TopologyFile[];
    gaps: string[];
}

export class TopologyEngine {
    constructor(private hubManager?: HubManagerGRPC) { }

    async scanProject(projectRoot: string): Promise<TopologyMap> {
        try {
            if (!this.hubManager) {
                logger.warn("⚠️ HubManager not provided to TopologyEngine. Returning empty map.");
                return { timestamp: new Date().toISOString(), sovereign: [], shadow: [], scripts: [], gaps: [] };
            }
            logger.info(`🗺️ [Topology] Requesting scan for: ${projectRoot}`);
            const results = await this.hubManager.scanTopology(projectRoot);
            return results || { timestamp: new Date().toISOString(), sovereign: [], shadow: [], scripts: [], gaps: [] };
        } catch (e: any) {
            logger.error(`🚨 gRPC topology scan failed: ${e.message}`);
            return { timestamp: new Date().toISOString(), sovereign: [], shadow: [], scripts: [], gaps: [] };
        }
    }

    static findRedundantAgents(sovereignFiles: TopologyFile[]): TopologyFile[] {
        const tsFiles = new Set(
            sovereignFiles.filter(f => f.extension === ".ts").map(f => f.path.replace(/\.ts$/, ""))
        );
        return sovereignFiles
            .filter(f => f.extension === ".py" && f.path.includes("agents"))
            .filter(f => tsFiles.has(f.path.replace(/\.py$/, "")));
    }
}

export class TopologyInfoProvider {
    static async get(git: GitClient, agentPath: Path): Promise<{ path: string, remote: string | null, branch: string | null }[]> {
        try {
            const remote = await git.discoverRemote();
            const branch = await git.getCurrentBranch();
            return [{ path: agentPath.toString(), remote, branch }];
        } catch {
            return [{ path: agentPath.toString(), remote: null, branch: null }];
        }
    }
}

/**
 * 🛡️ ResilienceHealingArchitectService
 * Serviço Soberano da Super Persona resilience_healing_architect.
 * Centraliza persistência de estabilidade, memória cognitiva, varredura nativa do sistema e integração SIMD/FFI.
 */
export class ResilienceHealingArchitectService {
    private ledger: StabilityLedger;

    constructor(projectRoot: string = process.cwd()) {
        this.ledger = new StabilityLedger(projectRoot);
    }

    syncLedger() {
        return this.ledger.sync();
    }
}

export class HistoryAgent {
    private db: Database;

    constructor(projectRoot: string) {
        const dbPath = new Path(projectRoot).join("system_vault.db").toString();
        this.db = new Database(dbPath);
        this.initDb();
    }

    private initDb() {
        this.db.run(`CREATE TABLE IF NOT EXISTS projects (id INTEGER PRIMARY KEY AUTOINCREMENT, path TEXT UNIQUE, name TEXT, last_diagnostic DATETIME, health_score FLOAT DEFAULT 0)`);
        this.db.run(`CREATE TABLE IF NOT EXISTS health_history (id INTEGER PRIMARY KEY AUTOINCREMENT, project_id INTEGER, timestamp DATETIME DEFAULT CURRENT_TIMESTAMP, score FLOAT, alerts INTEGER, entropy_avg FLOAT, breakdown_json TEXT)`);
        this.db.run(`CREATE TABLE IF NOT EXISTS ai_tasks (id INTEGER PRIMARY KEY AUTOINCREMENT, project_id INTEGER, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, task_type TEXT, target_file TEXT, status TEXT DEFAULT 'PENDING', result TEXT)`);
        this.db.run(`CREATE TABLE IF NOT EXISTS ai_insights (id INTEGER PRIMARY KEY AUTOINCREMENT, timestamp DATETIME DEFAULT CURRENT_TIMESTAMP, mode TEXT, insight TEXT, tokens_used INTEGER, impact_level TEXT)`);
        this.db.run(`CREATE TABLE IF NOT EXISTS user_activity (id INTEGER PRIMARY KEY AUTOINCREMENT, timestamp DATETIME DEFAULT CURRENT_TIMESTAMP, app_name TEXT, category TEXT, duration_seconds INTEGER)`);
        this.db.run(`CREATE TABLE IF NOT EXISTS memory_baseline (id INTEGER PRIMARY KEY AUTOINCREMENT, timestamp DATETIME DEFAULT CURRENT_TIMESTAMP, ram_percent FLOAT, is_idle BOOLEAN)`);
        this.db.run(`CREATE TABLE IF NOT EXISTS system_settings (key TEXT PRIMARY KEY, value TEXT)`);
    }

    getSetting(key: string, defaultValue: string = "false"): string {
        const query = this.db.query("SELECT value FROM system_settings WHERE key = ?");
        const row = query.get(key) as { value: string } | null;
        return row ? row.value : defaultValue;
    }

    setSetting(key: string, value: any) {
        try {
            this.db.run("INSERT OR REPLACE INTO system_settings (key, value) VALUES (?, ?)", [key, String(value)]);
        } catch (e) {
            logger.error(`❌ Erro ao salvar config ${key}: ${e}`);
        }
    }

    recordInsight(mode: string, insight: string, tokens: number = 0, impact: string = "LOW") {
        try {
            this.db.run("INSERT INTO ai_insights (mode, insight, tokens_used, impact_level) VALUES (?, ?, ?, ?)", [mode, insight, tokens, impact]);
            logger.info(`🧠 [History] Insight de ${mode} registrado.`);
        } catch (e) {
            logger.error(`❌ Erro ao salvar insight: ${e}`);
        }
    }

    recordSnapshot(score: number, alerts: number, entropy: number, breakdown: any = null) {
        try {
            const bJson = breakdown ? JSON.stringify(breakdown) : null;
            this.db.run("INSERT INTO health_history (score, alerts, entropy_avg, breakdown_json) VALUES (?, ?, ?, ?)", [score, alerts, entropy, bJson]);
            this.checkEntropyTrend(entropy);
            logger.info(`📊 [History] Snapshot salvo: Score ${score}%`);
        } catch (e) {
            logger.error(`❌ Erro ao salvar histórico: ${e}`);
        }
    }

    private checkEntropyTrend(currentEntropy: number) {
        const query = this.db.query("SELECT entropy_avg FROM health_history ORDER BY timestamp DESC LIMIT 1 OFFSET 1");
        const row = query.get() as { entropy_avg: number } | null;
        if (row && row.entropy_avg > 0) {
            const growth = (currentEntropy - row.entropy_avg) / row.entropy_avg;
            if (growth > 0.10) {
                logger.warn(`🌡️ [Heatmap] Alerta: A entropia sistêmica cresceu ${(growth * 100).toFixed(1)}%! Refatoração recomendada.`);
            }
        }
    }

    generateTrendData(): number[] {
        const query = this.db.query("SELECT score FROM health_history ORDER BY timestamp DESC LIMIT 30");
        const rows = query.all() as { score: number }[];
        return rows.map(r => r.score).reverse();
    }
}

export class UpdateTransaction {
    private backups: Map<string, string> = new Map();
    private active: boolean = false;

    constructor() { }

    async begin(files: string[]) {
        if (this.active) throw new Error("Transação já em curso.");
        this.active = true;
        this.backups.clear();

        for (const file of files) {
            try {
                const stat = await Bun.file(file).exists();
                if (stat) {
                    const content = await Bun.file(file).text();
                    this.backups.set(file, content);
                }
            } catch (e) {
                logger.error(`❌ Falha ao criar backup de ${file}: ${e}`);
            }
        }
        logger.info(`🛡️ [Transaction] Iniciada para ${files.length} arquivos.`);
    }

    commit() {
        this.backups.clear();
        this.active = false;
        logger.info("✅ [Transaction] Alterações confirmadas com sucesso.");
    }

    async rollback() {
        logger.warn(`⏪ [Transaction] Revertendo ${this.backups.size} alterações...`);
        for (const [file, content] of this.backups.entries()) {
            try {
                await Bun.write(file, content);
            } catch (e) {
                logger.error(`🚨 Falha crítica no rollback de ${file}: ${e}`);
            }
        }
        this.backups.clear();
        this.active = false;
    }
}
