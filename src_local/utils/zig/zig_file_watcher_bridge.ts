import winston from "winston";
import { dlopen, FFIType, suffix } from "bun:ffi";
import * as path from "node:path";
import * as fs from "node:fs";
import { SovereignResourceBudget } from "../../engines/maintenance/sovereign_resource_budget.ts";
import { eventBus } from "../../core/event_bus.ts";

const logger = winston.createLogger({
    level: "info",
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message }) => `${timestamp} - ZigWatcher - ${level.toUpperCase()} - ${message}`)
    ),
    transports: [new winston.transports.Console()]
});

export class ZigFileWatcherBridge {
    private static instance: ZigFileWatcherBridge;
    private zigLib: any = null;
    private isZigAvailable: boolean = false;
    private isWatchingActive: boolean = false;
    private watchIntervalMs: number = 3000;

    // Fallback in-memory queue when FFI is unavailable
    private fallbackEventQueue: string[] = [];
    private boundOnResourceModeChanged: any;

    constructor(projectRoot: string = process.cwd()) {
        this.initLibrary(projectRoot);
        this.setupBudgetIntegration();
    }

    public static getInstance(projectRoot?: string): ZigFileWatcherBridge {
        if (!ZigFileWatcherBridge.instance) {
            ZigFileWatcherBridge.instance = new ZigFileWatcherBridge(projectRoot);
        }
        return ZigFileWatcherBridge.instance;
    }

    private initLibrary(projectRoot: string): void {
        try {
            const zigLibName = `libzig_analyzer.so`;
            const zigSearchPaths = [
                path.join(projectRoot, "src_native", "zig_analyzer", zigLibName),
                path.join(projectRoot, "bin", zigLibName)
            ];

            const zigLibPath = zigSearchPaths.find(p => fs.existsSync(p));

            if (zigLibPath) {
                this.zigLib = dlopen(zigLibPath, {
                    start_daemon_watcher: {
                        args: [FFIType.cstring, FFIType.u64, FFIType.u32],
                        returns: FFIType.bool
                    },
                    poll_file_events: {
                        args: [FFIType.ptr, FFIType.u64],
                        returns: FFIType.u64
                    },
                    update_watch_throttle: {
                        args: [FFIType.u32],
                        returns: FFIType.void
                    },
                    stop_daemon_watcher: {
                        args: [],
                        returns: FFIType.void
                    },
                    get_daemon_memory_bytes: {
                        args: [],
                        returns: FFIType.u64
                    },
                    simulate_file_change: {
                        args: [FFIType.cstring, FFIType.u64],
                        returns: FFIType.void
                    }
                });
                this.isZigAvailable = true;
                logger.info(`⚡ [ZigWatcher] Biblioteca nativa ZIG carregada por FFI com sucesso: ${zigLibPath}`);
            } else {
                logger.info("ℹ️ [ZigWatcher] Biblioteca nativa ZIG não encontrada. Ativando fallback em memória.");
            }
        } catch (err: any) {
            logger.warn(`⚠️ [ZigWatcher] Falha ao inicializar FFI nativo ZIG: ${err.message}. Ativando fallback em memória.`);
            this.isZigAvailable = false;
        }
    }

    private setupBudgetIntegration(): void {
        const budget = SovereignResourceBudget.getInstance();
        const initialConfig = budget.getAdaptiveConfig();
        this.watchIntervalMs = initialConfig.fileWatchIntervalMs;

        this.boundOnResourceModeChanged = ({ mode, config }: any) => {
            const previousInterval = this.watchIntervalMs;
            this.watchIntervalMs = config.fileWatchIntervalMs;

            if (previousInterval !== this.watchIntervalMs) {
                logger.info(`🔄 [ZigWatcher] Throttle ajustado via SovereignResourceBudget para modo ${mode}: ${this.watchIntervalMs}ms`);
                this.updateThrottle(this.watchIntervalMs);
            }
        };

        // Listen to dynamic resource changes
        eventBus.on("resource:mode_changed", this.boundOnResourceModeChanged);
    }

    public startWatcher(dirPath: string): boolean {
        if (this.isWatchingActive) return false;

        this.isWatchingActive = true;
        logger.info(`🚀 [ZigWatcher] Iniciando monitoramento para: ${dirPath} (Intervalo: ${this.watchIntervalMs}ms)`);

        if (this.isZigAvailable && this.zigLib) {
            try {
                const pathBuffer = Buffer.from(dirPath + "\0", "utf-8");
                return this.zigLib.symbols.start_daemon_watcher(pathBuffer, BigInt(dirPath.length), this.watchIntervalMs);
            } catch (err: any) {
                logger.error(`❌ [ZigWatcher] Erro FFI start_daemon_watcher: ${err.message}`);
                return false;
            }
        }

        return true;
    }

    public pollEvents(): string[] {
        if (!this.isWatchingActive) return [];

        const polled: string[] = [];

        if (this.isZigAvailable && this.zigLib) {
            try {
                const maxPathLen = 256;
                const buffer = new Uint8Array(maxPathLen);

                while (true) {
                    const bytesPolled = this.zigLib.symbols.poll_file_events(buffer, BigInt(maxPathLen));
                    const count = Number(bytesPolled);
                    if (count === 0) break;

                    const filePath = new TextDecoder().decode(buffer.subarray(0, count));
                    polled.push(filePath);
                }
            } catch (err: any) {
                logger.error(`❌ [ZigWatcher] Erro FFI poll_file_events: ${err.message}`);
            }
        } else {
            // Fallback: drain in-memory queue
            while (this.fallbackEventQueue.length > 0) {
                polled.push(this.fallbackEventQueue.shift()!);
            }
        }

        return polled;
    }

    public updateThrottle(intervalMs: number): void {
        this.watchIntervalMs = intervalMs;
        if (this.isZigAvailable && this.zigLib) {
            try {
                this.zigLib.symbols.update_watch_throttle(intervalMs);
            } catch (err: any) {
                logger.error(`❌ [ZigWatcher] Erro FFI update_watch_throttle: ${err.message}`);
            }
        }
    }

    public stopWatcher(): void {
        this.isWatchingActive = false;
        logger.info("🛑 [ZigWatcher] Monitoramento parado.");

        if (this.isZigAvailable && this.zigLib) {
            try {
                this.zigLib.symbols.stop_daemon_watcher();
            } catch (err: any) {
                logger.error(`❌ [ZigWatcher] Erro FFI stop_daemon_watcher: ${err.message}`);
            }
        }
    }

    public getMemoryBytes(): number {
        if (this.isZigAvailable && this.zigLib) {
            try {
                return Number(this.zigLib.symbols.get_daemon_memory_bytes());
            } catch (err: any) {
                logger.error(`❌ [ZigWatcher] Erro FFI get_daemon_memory_bytes: ${err.message}`);
                return 0;
            }
        }
        // Fallback in-memory footprint estimation
        return 2097152; // Stable 2MB overhead estimation
    }

    public simulateFileChange(filePath: string): void {
        if (this.isZigAvailable && this.zigLib) {
            try {
                const pathBuffer = Buffer.from(filePath, "utf-8");
                this.zigLib.symbols.simulate_file_change(pathBuffer, BigInt(filePath.length));
            } catch (err: any) {
                logger.error(`❌ [ZigWatcher] Erro FFI simulate_file_change: ${err.message}`);
            }
        } else {
            this.fallbackEventQueue.push(filePath);
        }
    }

    public isNativeWatcherAvailable(): boolean {
        return this.isZigAvailable;
    }

    public getWatchInterval(): number {
        return this.watchIntervalMs;
    }

    public release(): void {
        this.stopWatcher();
        if (this.boundOnResourceModeChanged) {
            eventBus.off("resource:mode_changed", this.boundOnResourceModeChanged);
        }
    }
}
