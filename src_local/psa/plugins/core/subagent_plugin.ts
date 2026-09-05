import type { PsaPlugin } from "../../kernel/psa_plugin.ts";
import type { PsaContext } from "../../kernel/psa_context.ts";
import { PsaAgentLoop } from "../../core/psa_agent_loop.ts";

export interface SubagentResult {
    parentSessionId?: string;
    childSessionId: string;
    persona: string;
    model: string;
    synthesizedOutput: string;
    status: "completed" | "error";
    eventsCount: number;
    durationMs: number;
}

export class SubagentPlugin implements PsaPlugin {
    public name = "psa-plugin-subagent";
    public version = "1.0.0";
    public description = "Orquestrador de subagentes concorrentes com sessões forkadas e delegação hierárquica.";

    public apply(ctx: PsaContext): void {
        ctx.tools.register({
            name: "subagent.spawn",
            description: "Delega uma tarefa para um subagente especializado em sessão paralela e retorna o resultado sintetizado.",
            schema: {
                type: "object",
                properties: {
                    persona: { type: "string", description: "Identificador da Persona do subagente (ex: audit_code_guardian, sys_perf_architect)" },
                    prompt: { type: "string", description: "Instrução específica a ser executada pelo subagente" },
                    model: { type: "string", description: "Modelo opcional (deepseek-v4-flash ou deepseek-v4-pro)" },
                    parentSessionId: { type: "string", description: "ID da sessão pai que originou a delegação" }
                },
                required: ["persona", "prompt"]
            },
            isExclusive: false,
            execute: async (args: { persona: string; prompt: string; model?: string; parentSessionId?: string }): Promise<SubagentResult> => {
                const startTime = Date.now();
                const childModel = args.model || "deepseek-v4-flash";
                const childId = `sub_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;

                // Cria sessão filha com parentSessionId
                ctx.sessions.create({
                    sessionId: childId,
                    persona: args.persona,
                    model: childModel,
                    parentSessionId: args.parentSessionId
                });

                await ctx.events.emit("subagent/spawned", {
                    childSessionId: childId,
                    parentSessionId: args.parentSessionId,
                    persona: args.persona,
                    prompt: args.prompt
                });

                // Executa o Agent Loop na sessão filha
                const childLoop = new PsaAgentLoop(ctx);
                let textAccumulated = "";
                let eventsCount = 0;

                try {
                    for await (const ev of childLoop.runTurn({
                        sessionId: childId,
                        prompt: args.prompt,
                        persona: args.persona,
                        model: childModel,
                        autoApproveIfTest: true
                    })) {
                        eventsCount++;
                        if (ev.type === "text") {
                            textAccumulated += ev.content;
                        }
                    }

                    const result: SubagentResult = {
                        parentSessionId: args.parentSessionId,
                        childSessionId: childId,
                        persona: args.persona,
                        model: childModel,
                        synthesizedOutput: textAccumulated || `[Subagente ${args.persona}] Tarefa executada com sucesso.`,
                        status: "completed",
                        eventsCount,
                        durationMs: Date.now() - startTime
                    };

                    await ctx.events.emit("subagent/completed", result);
                    return result;
                } catch (err: any) {
                    return {
                        parentSessionId: args.parentSessionId,
                        childSessionId: childId,
                        persona: args.persona,
                        model: childModel,
                        synthesizedOutput: `Falha no subagente: ${err.message}`,
                        status: "error",
                        eventsCount,
                        durationMs: Date.now() - startTime
                    };
                }
            }
        });
    }
}
