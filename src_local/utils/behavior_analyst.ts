import { Database } from "bun:sqlite";
import winston from "winston";
import { execSync } from "node:child_process";
import { Path } from "../core/path_utils.ts";
import { ActivityClassifier } from "./activity_classifier.ts";

const logger = winston.child({ module: "BehaviorAnalyst" });

/**
 * Analista Comportamental Digital PhD.
 * Monitora o contexto de uso para adaptar a intensidade do sistema.
 */
export class BehaviorAnalyst {
    private db: Database;
    private lastApp: string | null = null;
    private startTime: number = Date.now();
    private windowCache: { data: { app: string, title: string }, timestamp: number } | null = null;
    private readonly CACHE_TTL = 30000;

    constructor(projectRoot: string) {
        const dbPath = new Path(projectRoot).join("system_vault.db").toString();
        this.db = new Database(dbPath);
    }

    /**
     * Obtém a janela em foco usando PowerShell com cache.
     */
    getActiveWindow(): { app: string, title: string } {
        if (this.isCacheValid()) return this.windowCache!.data;

        try {
            if (process.platform !== "win32") return { app: "System (Headless)", title: "N/A" };

            const data = this.runWin32PowerShell();
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

    private runWin32PowerShell(): { app: string, title: string } {
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

        const output = execSync(`powershell -Command "${cmd.replace(/\n/g, '')}"`, { encoding: 'utf8' }).trim();
        const [app, title] = output.split('|');
        return { app: app || "Unknown", title: title || "" };
    }

    classifyActivity(app: string, title: string): string {
        return ActivityClassifier.classify(app, title);
    }

    /**
     * Registra a atividade atual e retorna a categoria.
     */
    logActivity(): string {
        const { app, title } = this.getActiveWindow();
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
            this.db.run(
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

    /** Parity stub: _init_db */
    public _init_db(): void { }
    /** Parity stub: get_active_window_info */
    public get_active_window_info(): any { return this.getActiveWindow(); }
    /** Parity stub: record_memory_state */
    public record_memory_state(): void { }
    /** Parity stub: get_smart_memory_limit */
    public get_smart_memory_limit(): number { return 1024; }
    /** Parity stub: _save_to_db */
    public _save_to_db(): void { }
}

/** Parity: DigitalBehaviorAnalyst — Legacy alias for BehaviorAnalyst. */
export class DigitalBehaviorAnalyst extends BehaviorAnalyst { }
