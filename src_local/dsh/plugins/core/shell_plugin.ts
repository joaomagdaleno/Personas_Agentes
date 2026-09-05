import { spawn } from "node:child_process";
import * as path from "node:path";
import type { DshPlugin } from "../../kernel/dsh_plugin.ts";
import type { DshContext } from "../../kernel/dsh_context.ts";

export interface ShellExecResult {
    command: string;
    exitCode: number;
    stdout: string;
    stderr: string;
    durationMs: number;
    timedOut: boolean;
}

export class ShellPlugin implements DshPlugin {
    public name = "dsh-plugin-shell";
    public version = "1.0.0";
    public description = "Executor soberano de comandos no shell nativo do sistema operacional com proteção e auditoria.";

    public apply(ctx: DshContext): void {
        ctx.tools.register({
            name: "shell.exec",
            description: "Executa um comando no terminal do sistema operacional (PowerShell no Windows) de forma segura.",
            schema: {
                type: "object",
                properties: {
                    command: { type: "string", description: "Comando a ser executado" },
                    cwd: { type: "string", description: "Diretório de trabalho relativo ao workspace" },
                    timeoutMs: { type: "number", description: "Tempo limite em ms (padrão 15000ms)" }
                },
                required: ["command"]
            },
            isExclusive: true, // Requer aprovação de segurança
            execute: async (args: { command: string; cwd?: string; timeoutMs?: number }): Promise<ShellExecResult> => {
                const startTime = Date.now();
                const timeoutLimit = args.timeoutMs || 15000;
                const workingDir = args.cwd ? path.resolve(ctx.workspaceRoot, args.cwd) : ctx.workspaceRoot;

                const isWindows = process.platform === "win32";
                const shellBinary = isWindows ? "powershell.exe" : "bash";
                const shellArgs = isWindows ? ["-NoProfile", "-NonInteractive", "-Command", args.command] : ["-c", args.command];

                return new Promise<ShellExecResult>((resolve) => {
                    let stdoutBuffer = "";
                    let stderrBuffer = "";
                    let timedOut = false;

                    const child = spawn(shellBinary, shellArgs, {
                        cwd: workingDir,
                        env: { ...process.env, PAGER: "cat" },
                        windowsHide: true
                    });

                    const timer = setTimeout(() => {
                        timedOut = true;
                        child.kill("SIGTERM");
                        setTimeout(() => child.kill("SIGKILL"), 1000);
                    }, timeoutLimit);

                    child.stdout.on("data", (data) => {
                        stdoutBuffer += data.toString();
                        if (stdoutBuffer.length > 50000) {
                            stdoutBuffer = stdoutBuffer.substring(0, 50000) + "\n[...saída truncada pelo buffer DSH...]";
                        }
                    });

                    child.stderr.on("data", (data) => {
                        stderrBuffer += data.toString();
                        if (stderrBuffer.length > 20000) {
                            stderrBuffer = stderrBuffer.substring(0, 20000) + "\n[...erros truncados pelo buffer DSH...]";
                        }
                    });

                    child.on("error", (err) => {
                        clearTimeout(timer);
                        resolve({
                            command: args.command,
                            exitCode: -1,
                            stdout: stdoutBuffer,
                            stderr: `Erro de execução do processo: ${err.message}`,
                            durationMs: Date.now() - startTime,
                            timedOut
                        });
                    });

                    child.on("close", (code) => {
                        clearTimeout(timer);
                        resolve({
                            command: args.command,
                            exitCode: code ?? (timedOut ? -2 : 0),
                            stdout: stdoutBuffer.trim(),
                            stderr: stderrBuffer.trim(),
                            durationMs: Date.now() - startTime,
                            timedOut
                        });
                    });
                });
            }
        });
    }
}
