import winston from "winston";
import { exec } from "node:child_process";
import { promisify } from "node:util";
import { DatabaseHub } from "../core/database_hub.ts";
import { ActivityClassifier } from "./activity_classifier.ts";

const execAsync = promisify(exec);
const logger = winston.child({ module: "BehaviorAnalyst" });

/**
 * Analista Comportamental Digital PhD.
 * Monitora o contexto de uso para adaptar a intensidade do sistema.
 */
export class BehaviorAnalyst {
    private dbHub: DatabaseHub;
    private lastApp: string | null = null;
    private startTime: number = Date.now();
    private windowCache: { data: { app: string, title: string }, timestamp: number } | null = null;
    private readonly CACHE_TTL = 30000;

    constructor(projectRoot: string) {
        this.dbHub = DatabaseHub.getInstance(projectRoot);
    }

    /**
     * Obtém a janela em foco usando PowerShell com cache.
     */
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

    /**
     * Registra a atividade atual e retorna a categoria.
     */
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
