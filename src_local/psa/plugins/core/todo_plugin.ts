import type { PsaPlugin } from "../../kernel/psa_plugin.ts";
import type { PsaContext } from "../../kernel/psa_context.ts";

export type TodoStatus = "pending" | "in_progress" | "completed";

export interface TodoItem {
    content: string;
    status: TodoStatus;
}

export interface TodoCounts {
    pending: number;
    inProgress: number;
    completed: number;
}

export interface TodoPluginConfig {
    /** Permite múltiplas tarefas em in_progress ao mesmo tempo (útil para subagentes concorrentes) */
    allowParallelInProgress?: boolean;
}

/**
 * 📝 PsaTodoPlugin
 *
 * Implementação fiel da ferramenta de rastreamento de tarefas imperativa do modelo (`todo_write` e `todo.write`/`todo.list`).
 * O modelo envia a lista COMPLETA de tarefas a cada atualização (snapshot), garantindo coerência global
 * e eliminando erros de mutação parcial. O estado é projetado e emitido nos eventos da sessão.
 */
export class TodoPlugin implements PsaPlugin {
    public name = "psa-plugin-todo";
    public version = "1.0.0";
    public description = "Gerenciamento estruturado de tarefas do agente com snapshot imperativo e projeção de progresso.";

    private allowParallelInProgress: boolean;
    private currentTodos: Map<string, TodoItem[]> = new Map(); // sessionId -> TodoItem[]

    constructor(config: TodoPluginConfig = {}) {
        this.allowParallelInProgress = config.allowParallelInProgress ?? true;
    }

    public apply(ctx: PsaContext): void {
        const validateTodos = (raw: { content: string; status: string }[], allowParallel: boolean): TodoItem[] => {
            if (!Array.isArray(raw)) {
                throw new Error("todos deve ser um array de tarefas.");
            }
            const todos: TodoItem[] = [];
            const seen = new Set<string>();
            let inProgressCount = 0;

            for (const item of raw) {
                if (typeof item.content !== "string") {
                    throw new Error("Cada tarefa deve conter um campo `content` de texto.");
                }
                const content = item.content.trim();
                if (content.length === 0) {
                    throw new Error("invalid todo: `content` não pode ser vazio.");
                }
                if (seen.has(content)) {
                    throw new Error(`invalid todos: conteúdo duplicado "${content}".`);
                }
                seen.add(content);

                const status = item.status as TodoStatus;
                if (status !== "pending" && status !== "in_progress" && status !== "completed") {
                    throw new Error(`Status inválido "${item.status}". Use 'pending', 'in_progress' ou 'completed'.`);
                }
                if (status === "in_progress") {
                    inProgressCount++;
                }

                todos.push({ content, status });
            }

            if (!allowParallel && inProgressCount > 1) {
                throw new Error(`invalid todos: no máximo uma tarefa pode estar em 'in_progress' simultaneamente (encontradas ${inProgressCount}).`);
            }

            return todos;
        };

        const computeCounts = (todos: TodoItem[]): TodoCounts => ({
            pending: todos.filter(t => t.status === "pending").length,
            inProgress: todos.filter(t => t.status === "in_progress").length,
            completed: todos.filter(t => t.status === "completed").length,
        });

        const executeWrite = async (args: { todos: { content: string; status: string }[]; sessionId?: string }) => {
            const todos = validateTodos(args.todos, this.allowParallelInProgress);
            const sessionId = args.sessionId || "default";
            this.currentTodos.set(sessionId, todos);

            const counts = computeCounts(todos);

            // Emite evento no SessionService se a sessão existir
            if (args.sessionId && ctx.sessions.has(args.sessionId)) {
                ctx.sessions.appendEvent(args.sessionId, {
                    type: "todo/write",
                    data: { todos, counts }
                });
            }

            // Emite no barramento de eventos do kernel
            ctx.events.emit("todo:updated", { sessionId, todos, counts });

            return {
                todos,
                counts,
                message: `Lista de tarefas atualizada: ${counts.pending} pendentes, ${counts.inProgress} em andamento, ${counts.completed} concluídas.`
            };
        };

        // Registra alias canônico upstream: todo_write
        ctx.tools.register({
            name: "todo_write",
            description: "Registra ou atualiza a lista de tarefas da execução atual. Envie a lista COMPLETA a cada chamada — ela substitui integralmente a lista anterior.",
            schema: {
                type: "object",
                properties: {
                    todos: {
                        type: "array",
                        description: "A lista COMPLETA de tarefas que substitui a anterior.",
                        items: {
                            type: "object",
                            properties: {
                                content: { type: "string", description: "O que deve ser feito (descrição imperativa da tarefa)." },
                                status: { type: "string", enum: ["pending", "in_progress", "completed"], description: "pending | in_progress | completed" }
                            },
                            required: ["content", "status"]
                        }
                    },
                    sessionId: { type: "string", description: "ID opcional da sessão ativa" }
                },
                required: ["todos"]
            },
            isExclusive: false,
            execute: executeWrite
        });

        // Registra alias moderno sob namespace: todo.write
        ctx.tools.register({
            name: "todo.write",
            description: "Atualiza a lista integral de tarefas do agente (alias moderno para todo_write).",
            schema: {
                type: "object",
                properties: {
                    todos: {
                        type: "array",
                        description: "Lista completa de tarefas.",
                        items: {
                            type: "object",
                            properties: {
                                content: { type: "string" },
                                status: { type: "string", enum: ["pending", "in_progress", "completed"] }
                            },
                            required: ["content", "status"]
                        }
                    },
                    sessionId: { type: "string" }
                },
                required: ["todos"]
            },
            isExclusive: false,
            execute: executeWrite
        });

        // Ferramenta de leitura: todo.list
        ctx.tools.register({
            name: "todo.list",
            description: "Consulta o estado atual da lista de tarefas e contadores da sessão ativa.",
            schema: {
                type: "object",
                properties: {
                    sessionId: { type: "string", description: "ID opcional da sessão para consultar" }
                }
            },
            isExclusive: false,
            execute: async (args: { sessionId?: string }) => {
                const sessionId = args.sessionId || "default";
                const todos = this.currentTodos.get(sessionId) || [];
                return {
                    sessionId,
                    todos,
                    counts: computeCounts(todos)
                };
            }
        });
    }
}
