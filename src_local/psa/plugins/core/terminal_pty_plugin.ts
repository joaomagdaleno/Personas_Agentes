import type { PsaPlugin } from "../../kernel/psa_plugin.ts";
import type { PsaContext } from "../../kernel/psa_context.ts";

export interface TerminalSession {
    id: string;
    proc: any;
    command: string;
    createdAt: number;
    outputBuffer: string[];
    isAlive: boolean;
}

/**
 * 💻 PsaTerminalPtyPlugin
 *
 * Implementação fiel da ferramenta de terminal interativo persistente (`tool-terminal` no upstream).
 * Diferente do `shell.exec` (que executa e fecha), o `terminal` mantém um processo aberto em segundo plano
 * permitindo ao modelo:
 * 1. `terminal.create`: Abrir uma sessão interativa (PowerShell, bash, node, python, etc.).
 * 2. `terminal.send`: Enviar comandos ou respostas interativas (ex: 'y/n', senhas, entradas de CLI).
 * 3. `terminal.read`: Ler o buffer de saída acumulado desde a última leitura.
 * 4. `terminal.kill`: Encerrar a sessão interativa.
 */
export class TerminalPtyPlugin implements PsaPlugin {
    public name = "psa-plugin-terminal-pty";
    public version = "1.0.0";
    public description = "Sessões interativas contínuas de terminal persistente com suporte a entrada/saída assíncrona bidirecional.";

    private sessions: Map<string, TerminalSession> = new Map();

    public apply(ctx: PsaContext): void {
        // 1. terminal.create
        ctx.tools.register({
            name: "terminal.create",
            description: "Abre uma sessão de terminal interativa contínua em segundo plano (ex: powershell, node, python).",
            schema: {
                type: "object",
                properties: {
                    shell: { type: "string", description: "Executável da shell (padrão: powershell na plataforma Windows)" },
                    sessionId: { type: "string", description: "Identificador opcional da sessão de terminal" }
                }
            },
            isExclusive: false,
            execute: async (args: { shell?: string; sessionId?: string }) => {
                const id = args.sessionId || `pty_${Date.now().toString(36)}`;
                if (this.sessions.has(id)) {
                    throw new Error(`Sessão de terminal '${id}' já existe.`);
                }

                const isWin = process.platform === "win32";
                const defaultShell = isWin ? "cmd.exe" : "bash";
                const shellCmd = args.shell || defaultShell;
                const spawnArgs = isWin && shellCmd.includes("cmd") ? [shellCmd, "/k"] : [shellCmd];

                const proc = Bun.spawn(spawnArgs, {
                    cwd: ctx.workspaceRoot,
                    stdin: "pipe",
                    stdout: "pipe",
                    stderr: "pipe"
                });

                const session: TerminalSession = {
                    id,
                    proc,
                    command: shellCmd,
                    createdAt: Date.now(),
                    outputBuffer: [],
                    isAlive: true
                };

                // Stream background reader
                const readStream = async (stream: ReadableStream, prefix = "") => {
                    const reader = stream.getReader();
                    const decoder = new TextDecoder();
                    try {
                        while (true) {
                            const { done, value } = await reader.read();
                            if (done) break;
                            const text = decoder.decode(value);
                            session.outputBuffer.push(prefix + text);
                        }
                    } catch {}
                };

                readStream(proc.stdout);
                readStream(proc.stderr, "[STDERR] ");

                proc.exited.then(() => {
                    session.isAlive = false;
                });

                this.sessions.set(id, session);
                return {
                    sessionId: id,
                    shell: shellCmd,
                    status: "running",
                    message: `Terminal persistente '${id}' iniciado com sucesso.`
                };
            }
        });

        // 2. terminal.send
        ctx.tools.register({
            name: "terminal.send",
            description: "Envia dados ou uma linha de comando para a entrada padrão (stdin) de um terminal interativo ativo.",
            schema: {
                type: "object",
                properties: {
                    sessionId: { type: "string", description: "ID da sessão de terminal" },
                    input: { type: "string", description: "Texto ou comando a enviar" },
                    addNewline: { type: "boolean", description: "Se deve adicionar quebra de linha ao final (padrão: true)" }
                },
                required: ["sessionId", "input"]
            },
            isExclusive: false,
            execute: async (args: { sessionId: string; input: string; addNewline?: boolean }) => {
                const session = this.sessions.get(args.sessionId);
                if (!session) {
                    throw new Error(`Sessão de terminal '${args.sessionId}' não encontrada.`);
                }
                if (!session.isAlive) {
                    throw new Error(`Sessão de terminal '${args.sessionId}' já foi finalizada.`);
                }

                const line = (args.addNewline ?? true) ? args.input + "\n" : args.input;
                session.proc.stdin.write(new TextEncoder().encode(line));
                await session.proc.stdin.flush();

                return {
                    sessionId: args.sessionId,
                    sentBytes: line.length,
                    status: "sent"
                };
            }
        });

        // 3. terminal.read
        ctx.tools.register({
            name: "terminal.read",
            description: "Lê e limpa o buffer de saída acumulado de um terminal interativo.",
            schema: {
                type: "object",
                properties: {
                    sessionId: { type: "string", description: "ID da sessão de terminal" },
                    clearBuffer: { type: "boolean", description: "Se deve esvaziar o buffer lido (padrão: true)" }
                },
                required: ["sessionId"]
            },
            isExclusive: false,
            execute: async (args: { sessionId: string; clearBuffer?: boolean }) => {
                const session = this.sessions.get(args.sessionId);
                if (!session) {
                    throw new Error(`Sessão de terminal '${args.sessionId}' não encontrada.`);
                }

                const output = session.outputBuffer.join("");
                if (args.clearBuffer ?? true) {
                    session.outputBuffer = [];
                }

                return {
                    sessionId: args.sessionId,
                    isAlive: session.isAlive,
                    output
                };
            }
        });

        // 4. terminal.kill
        ctx.tools.register({
            name: "terminal.kill",
            description: "Encerra forçadamente uma sessão interativa de terminal.",
            schema: {
                type: "object",
                properties: {
                    sessionId: { type: "string", description: "ID da sessão de terminal" }
                },
                required: ["sessionId"]
            },
            isExclusive: false,
            execute: async (args: { sessionId: string }) => {
                const session = this.sessions.get(args.sessionId);
                if (!session) {
                    return { sessionId: args.sessionId, message: "Sessão já inexistente." };
                }
                try {
                    session.proc.kill();
                } catch {}
                session.isAlive = false;
                this.sessions.delete(args.sessionId);

                return {
                    sessionId: args.sessionId,
                    status: "killed"
                };
            }
        });
    }

    public closeAll(): void {
        for (const session of this.sessions.values()) {
            try {
                session.proc.kill();
            } catch {}
            session.isAlive = false;
        }
        this.sessions.clear();
    }
}
