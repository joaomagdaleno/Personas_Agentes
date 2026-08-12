import * as fs from "node:fs";
import * as fsPromises from "node:fs/promises";
import * as path from "node:path";
import winston from "winston";
import { Path } from "../../core/path_utils.ts";
import { TaskExecutor } from "../maintenance/sys_perf_architect_service.ts";
import { HubManagerGRPC } from "../../core/hub_manager_grpc.ts";

const logger = winston.child({ module: "SyncDevopsArchitectService" });

export class LockCleaner {
    static clear(cwd: string) {
        const gitDir = path.join(cwd, ".git");
        if (fs.existsSync(gitDir)) {
            this.clearRecursive(gitDir);
        }
    }

    private static clearRecursive(dir: string) {
        const list = fs.readdirSync(dir);
        for (const file of list) {
            const fullPath = path.join(dir, file);
            if (fs.statSync(fullPath).isDirectory()) {
                this.clearRecursive(fullPath);
            } else if (file.endsWith(".lock")) {
                fs.unlinkSync(fullPath);
                logger.info(`🧹 Trava removida: ${file}`);
            }
        }
    }
}

export class GitClient {
    private cwd: string;
    private executor: TaskExecutor;

    constructor(cwd: string) {
        this.cwd = cwd;
        this.executor = new TaskExecutor();
    }

    async run(args: string[]): Promise<{ stdout: string; stderr: string; exitCode: number }> {
        return await this.executor.runCommand(`git ${args.join(" ")}`, this.cwd);
    }

    async getOutput(args: string[]): Promise<string> {
        const res = await this.run(args);
        return res.stdout.trim();
    }

    async fetchPrune(remote: string): Promise<void> {
        await this.run(["fetch", remote, "--prune"]);
    }

    async discoverRemote(): Promise<string | null> {
        return RemoteDiscoverer.discover(this as any);
    }

    async getCommitCount(revRange: string): Promise<number> {
        const res = await this.getOutput(["rev-list", "--count", revRange]);
        return parseInt(res || "0", 10);
    }

    async stashPush(msg: string): Promise<void> {
        await this.run(["stash", "push", "--include-untracked", "-m", msg]);
    }

    async stashPop(): Promise<void> {
        await this.run(["stash", "pop"]);
    }

    async rebase(target: string): Promise<number> {
        const res = await this.run(["rebase", target]);
        return res.exitCode;
    }

    async rebaseAbort(): Promise<void> {
        await this.run(["rebase", "--abort"]);
    }

    async resetHard(target: string): Promise<number> {
        const res = await this.run(["reset", "--hard", target]);
        return res.exitCode;
    }

    async getCurrentBranch(): Promise<string> {
        return await this.getOutput(["rev-parse", "--abbrev-ref", "HEAD"]);
    }

    async getTrackingBranch(activeBranch: string): Promise<string> {
        const t = await this.getOutput(["config", `branch.${activeBranch}.merge`]);
        return t ? t.replace("refs/heads/", "") : "main";
    }

    async getHeadHash(): Promise<string> {
        return await this.getOutput(["rev-parse", "HEAD"]);
    }

    async commitFix(fixDescription: string, files: string[]): Promise<string | null> {
        const timestamp = new Date().toISOString().replace(/[-T:]/g, "").slice(0, 12);
        const branchName = `sovereign/fix_${timestamp}`;

        logger.info(`👻 [Git] Criando branch de cura: ${branchName}`);
        await this.run(["checkout", "-b", branchName]);

        if (files.length > 0) {
            await this.run(["add", ...files]);
        } else {
            await this.run(["add", "."]);
        }

        const commitMsg = `fix(ai): ${fixDescription}\n\nAutomated fix by Sovereign AI during idle cycle.`;
        const res = await this.run(["commit", "-m", commitMsg]);

        if (res.exitCode === 0) {
            logger.info(`✅ [Git] Correção salva na branch ${branchName}.`);
            return branchName;
        } else {
            logger.error(`❌ [Git] Falha ao commitar: ${res.stderr}`);
            return null;
        }
    }

    async clearLocks(): Promise<void> {
        LockCleaner.clear(this.cwd);
    }

    async cleanCache(): Promise<void> {
        await this.run(["rm", "-r", "--cached", "**/__pycache__/*"]);
    }

    async syncSubmodules(): Promise<void> {
        await this.run(["submodule", "sync", "--recursive"]);
        await this.run(["submodule", "update", "--init", "--recursive"]);
    }

    async resolveBasicConflicts(): Promise<void> {
        const status = await this.getOutput(["status", "--porcelain"]);
        const conflicted = status.split("\n").filter(l => l.startsWith("UU") || l.startsWith("AA"));

        if (conflicted.length > 0) {
            logger.warn(`🚨 [Git] ${conflicted.length} conflitos detectados. Tentando resolução básica...`);
        }
    }

    public async is_clean_state(): Promise<boolean> {
        const res = await this.run(["status", "--porcelain"]);
        return res.stdout.trim() === "";
    }
}

export class GitSyncManager {
    constructor(private git: GitClient, private projectRoot: Path, private agentPath: Path) {}

    async executeGitSync(): Promise<boolean> {
        const remote = await this.git.discoverRemote();
        if (!remote) return false;

        await this.git.rebaseAbort();
        logger.info(`🔄 Sync: ${remote}`);
        await this.git.fetchPrune(remote);

        const target = await this.getTargetRef(remote);
        const commitsBehind = await this.git.getCommitCount(`HEAD..${target}`);

        if (commitsBehind === 0) {
            logger.info("✅ Versão Atualizada.");
            return true;
        }

        return await this.performPull(target, commitsBehind);
    }

    private async getTargetRef(remote: string): Promise<string> {
        const active = await this.git.getCurrentBranch();
        const tracking = await this.git.getTrackingBranch(active);
        return `${remote}/${tracking}`;
    }

    private async performPull(target: string, count: number): Promise<boolean> {
        logger.info(`⬇️ Puxando ${count} commits...`);
        await this.git.stashPush("Auto-sync");
        const rebased = await this.git.rebase(target) === 0;
        const success = rebased || await this.fallbackReset(target);
        return success ? await this.finalizeSync() : false;
    }

    private async fallbackReset(target: string): Promise<boolean> {
        logger.warn(`⚠️ Reset Hard para ${target}`);
        await this.git.rebaseAbort();
        return await this.git.resetHard(target) === 0;
    }

    private async finalizeSync(): Promise<boolean> {
        await this.gitAddSkills();
        await this.git.stashPop();
        logger.info("✨ Sync Sucesso.");
        return true;
    }

    private async gitAddSkills(): Promise<void> {
        const proc = Bun.spawn(["git", "add", ".agent/skills"], { cwd: this.projectRoot.toString() });
        await proc.exited;
    }
}

export class HubWatcher {
    private manager: HubManagerGRPC;
    private onChangeCallbacks: ((path: string) => void)[] = [];
    private host: string;

    constructor(host?: string, manager?: HubManagerGRPC) {
        this.host = host || "localhost:50051";
        this.manager = manager || HubManagerGRPC.getInstance(host);
    }

    start() {
        logger.info(`📡 [HubWatcher] Conectando ao gRPC Hub...`);
        this.listen();
    }

    private listen() {
        try {
            this.manager.watchEvents((event) => {
                if (event.type === "FILE_EVENT") {
                    this.notify(event.path);
                }
            });

            this.manager.watchHealth((update) => {
                if (update.cpuUsage > 80 || update.memoryUsage > 80) {
                    logger.warn(`⚠️ [HubWatcher] ALERTA DE SAÚDE: CPU ${update.cpuUsage}%, MEM ${update.memoryUsage}%`);
                }
            });
        } catch (err) {
            logger.warn(`⚠️ [HubWatcher] Falha ao iniciar streams gRPC: ${err}`);
        }
    }

    stop() {
        this.manager.close();
        logger.info(`📡 [HubWatcher] Conexão encerrada.`);
    }

    onChange(callback: (path: string) => void) {
        this.onChangeCallbacks.push(callback);
    }

    private notify(path: string) {
        if (path.includes(".git") || path.includes("node_modules")) return;
        logger.info(`✨ [HubWatcher] Mudança detectada: ${path}`);
        this.onChangeCallbacks.forEach(cb => cb(path));
    }
}

export class SubmoduleSyncLogic {
    async isLocked(lockPath: string): Promise<boolean> {
        try {
            const stats = await fsPromises.stat(lockPath).catch(() => null);
            if (!stats) return false;

            const mtime = stats.mtime;
            const diffMinutes = (Date.now() - mtime.getTime()) / (1000 * 60);

            if (diffMinutes > 10) {
                await fsPromises.unlink(lockPath).catch(() => { });
                return false;
            }
            return true;
        } catch {
            return false;
        }
    }

    async getSubmoduleDelta(git: GitClient, remote: string | null): Promise<any[]> {
        const startTime = Date.now();
        if (!remote) return [];

        try {
            await git.run(["fetch", remote]);
            const active = await git.getCurrentBranch();
            const tracking = await git.getTrackingBranch(active);
            const delta = await git.getCommitCount(`${active}..${remote}/${tracking}`);

            if (delta > 0) {
                const duration = (Date.now() - startTime) / 1000;
                logger.info(`Telemetry: Submodule delta check completed in ${duration.toFixed(4)}s`);
                return [{
                    file: ".agent/skills",
                    issue: `Delta: ${delta} commits pendentes no submódulo.`,
                    severity: "CRITICAL",
                    context: "DependencyAuditor"
                }];
            }
        } catch (e) {
            logger.warn(`⚠️ Erro ao verificar delta de submódulo: ${e}`);
        }

        return [];
    }
}

export class CacheManager {
    projectRoot: Path;
    cacheFile: Path;
    currentCache: Record<string, string> = {};

    constructor(projectRoot: string) {
        this.projectRoot = new Path(projectRoot);
        this.cacheFile = this.projectRoot.join(".gemini", "cache", "audit_cache.json");
        this.currentCache = this.load();
    }

    async updateAll() {
        logger.info("💾 [Cache] Persistindo todos os hashes em massa...");
        this.save();
    }

    private load(): Record<string, string> {
        if (fs.existsSync(this.cacheFile.toString())) {
            try {
                const content = fs.readFileSync(this.cacheFile.toString(), "utf-8");
                return JSON.parse(content);
            } catch (e) {
                logger.error(`🚨 [Cache] Falha ao carregar metadados: ${e}`);
            }
        }
        return {};
    }

    async getFileHash(filePath: Path | string): Promise<string> {
        const path = filePath instanceof Path ? filePath : new Path(filePath);
        if (!(await path.exists())) {
            return "";
        }
        try {
            const file = Bun.file(path.toString());
            const hasher = new Bun.CryptoHasher("sha256");
            const buffer = await file.arrayBuffer();
            hasher.update(buffer);
            return hasher.digest("hex");
        } catch (e) {
            logger.debug(`ℹ️ [Cache] Erro ao gerar hash de ${path.toString()}: ${e}`);
            return "";
        }
    }

    isChanged(relPath: string, newHash: string): boolean {
        return this.currentCache[relPath] !== newHash;
    }

    update(relPath: string, newHash: string) {
        this.currentCache[relPath] = newHash;
    }

    save() {
        try {
            const parentDir = this.cacheFile.parent().toString();
            if (!fs.existsSync(parentDir)) {
                fs.mkdirSync(parentDir, { recursive: true });
            }
            fs.writeFileSync(this.cacheFile.toString(), JSON.stringify(this.currentCache, null, 4), "utf-8");
        } catch (e) {
            logger.error(`🚨 [Cache] Falha fatal ao salvar memória: ${e}`);
        }
    }
}

/**
 * 🔄 SyncDevopsArchitectService
 * Serviço Soberano da Super Persona sync_devops_architect.
 * Centraliza gerenciamento de Git, observabilidade do Hub gRPC, sincronia de submódulos e cache de integridade.
 */
export class SyncDevopsArchitectService {
    private client: GitClient;

    constructor(cwd: string) {
        this.client = new GitClient(cwd);
    }

    async sync() {
        return this.client.syncSubmodules();
    }
}

export class ConflictPolicy {
    private root: Path;
    private git: GitClient;

    constructor(root: string) {
        this.root = new Path(root);
        this.git = new GitClient(root);
    }

    async resolveFile(file: string, isProtectedFn: (f: string) => boolean): Promise<boolean> {
        if (file.includes("__pycache__") || file.endsWith(".pyc")) {
            return this.resolveCache(file);
        }
        if (file === "skills_index.json") {
            return this.resolveOurs(file, "Priorizando índice local (Soberano)");
        }
        if (isProtectedFn(file)) {
            return this.resolveOurs(file, "Protegendo arquivo local (Protected)");
        }
        return this.resolveTheirs(file, "Priorizando upstream (padrão)");
    }

    private async resolveCache(file: string): Promise<boolean> {
        logger.info(`🗑️ Limpando conflito de cache: ${file}`);
        await this.git.run(["rm", "--cached", file]);
        return true;
    }

    private async resolveOurs(file: string, reason: string): Promise<boolean> {
        logger.info(`🛡️ ${reason}: ${file}`);
        await this.git.run(["checkout", "--ours", file]);
        await this.git.run(["add", file]);
        return true;
    }

    private async resolveTheirs(file: string, reason: string): Promise<boolean> {
        logger.info(`📡 ${reason}: ${file}`);
        await this.git.run(["checkout", "--theirs", file]);
        await this.git.run(["add", file]);
        return true;
    }
}

export class MaintenanceEnginePhd {
    static async cleanSubmodules(root: string, git: GitClient): Promise<void> {
        const displayPaths = await git.run(["submodule", "foreach", "--quiet", "echo $displaypath"]);
        if (displayPaths && displayPaths.exitCode === 0 && displayPaths.stdout) {
            const submodules = displayPaths.stdout.split("\n").filter(s => s.trim() !== "");
            for (const sub of submodules) {
                await this.cleanSingleSubmodule(root, sub.trim());
            }
        }
    }

    private static async cleanSingleSubmodule(root: string, sub: string): Promise<void> {
        const subPath = join(root, sub);
        if (fs.existsSync(subPath)) {
            logger.info(`🧹 [Maintenance] Limpando submódulo: ${sub}`);
            await Bun.spawn(["git", "clean", "-fd"], { cwd: subPath }).exited;
        }
    }

    static async mergeSkillsIndex(root: string, filePath: string, git: GitClient, protectedIds: string[]): Promise<boolean> {
        try {
            const ours = await this.getGitVersion(root, filePath, 2);
            const theirs = await this.getGitVersion(root, filePath, 3);
            const mergedMap = this.performSkillsMerge(ours, theirs, protectedIds);
            const result = Array.from(mergedMap.values()).sort((a, b) => (a.id || "").localeCompare(b.id || ""));
            await Bun.write(join(root, filePath), JSON.stringify(result, null, 2));
            return true;
        } catch (error) {
            logger.error(`❌ [Maintenance] Falha no merge de skills: ${error}`);
            return false;
        }
    }

    private static async getGitVersion(root: string, filePath: string, stage: number): Promise<any[]> {
        try {
            const res = await Bun.spawn(["git", "show", `:${stage}:${filePath}`], { cwd: root, stdout: "pipe" });
            const text = await new Response(res.stdout).text();
            return JSON.parse(text);
        } catch {
            logger.debug(`⚠️ Maintenance: Failed to parse stage ${stage} version of ${filePath}.`);
            return [];
        }
    }

    private static performSkillsMerge(ours: any[], theirs: any[], protectedIds: string[]): Map<string, any> {
        const mergedMap = new Map<string, any>();
        for (const item of theirs) { this.setIfHasId(mergedMap, item); }
        for (const item of ours) { this.setIfProtected(mergedMap, item, protectedIds); }
        return mergedMap;
    }

    private static setIfHasId(map: Map<string, any>, item: any) {
        if (item.id) map.set(item.id, item);
    }

    private static setIfProtected(map: Map<string, any>, item: any, protectedIds: string[]) {
        if (item.id && protectedIds.includes(item.id)) {
            map.set(item.id, item);
        }
    }
}

export class RemoteDiscoverer {
    static async discover(git: GitClient): Promise<string | null> {
        const output = await git.getOutput(["remote"]);
        const remotes = output.split("\n").map(r => r.trim());
        const targets = ["upstream", "origin"];
        for (const r of targets) {
            if (remotes.includes(r) && await this.isHeadsReady(git, r)) {
                return r;
            }
        }
        return remotes.length > 0 ? (remotes[0] as string) : null;
    }

    private static async isHeadsReady(git: GitClient, remote: string): Promise<boolean> {
        const res = await git.run(["ls-remote", "--heads", remote]);
        return res.exitCode === 0;
    }
}

// Aliases para Retrocompatibilidade de Personas Agentes
export { SyncDevopsArchitectService as DocGenAgent };
export { SyncDevopsArchitectService as TestArchitectAgent };
export { SyncDevopsArchitectService as TestifyPersona };
export { SyncDevopsArchitectService as TopologyGraphAgent };
export { SyncDevopsArchitectService as ValidationAgent };
