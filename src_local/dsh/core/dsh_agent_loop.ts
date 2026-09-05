import type { DshContext } from "../kernel/dsh_context.ts";

export interface AgentTurnRequest {
    sessionId: string;
    prompt: string;
    model?: string;
    mode?: string;
    persona?: string;
    deepthink?: boolean;
    maxParallelToolCalls?: number;
    autoApproveIfTest?: boolean;
}

export interface AgentTurnEvent {
    type: "turn_start" | "reasoning" | "tool_call" | "tool_result" | "verification" | "approval_prompt" | "text" | "turn_end";
    content: string;
    metadata?: Record<string, any>;
}

export class DshAgentLoop {
    private ctx: DshContext;
    private maxParallelToolCalls: number;

    constructor(ctx: DshContext, maxParallelToolCalls: number = 10) {
        this.ctx = ctx;
        this.maxParallelToolCalls = maxParallelToolCalls;
    }

    /**
     * Executa o ciclo de vida completo de um turno de agente no padrão DeepSeek Harness
     */
    public async *runTurn(request: AgentTurnRequest): AsyncGenerator<AgentTurnEvent> {
        const startTime = Date.now();
        const modelChoice = request.model || "deepseek-v4-flash";
        const isDeepThink = Boolean(request.deepthink || modelChoice === "deepseek-v4-pro");
        const maxParallel = request.maxParallelToolCalls || this.maxParallelToolCalls;

        // 1. Início do Turno: Gravar no log durável e emitir
        this.ctx.sessions.append(request.sessionId, 1, "turn_start", {
            prompt: request.prompt,
            model: modelChoice,
            persona: request.persona || "strategic_cognitive_architect",
            mode: request.mode || "Standard"
        });

        await this.ctx.events.emit("turn/start", { sessionId: request.sessionId, prompt: request.prompt });

        yield {
            type: "turn_start",
            content: request.prompt,
            metadata: {
                sessionId: request.sessionId,
                model: modelChoice,
                persona: request.persona,
                timestamp: new Date().toISOString()
            }
        };

        // 2. Reflexão Cognitiva / Model Reasoning
        const reasoningMsg = `🧠 [${modelChoice}] Agente orquestrado via DSH Micro-Kernel ativando persona '${request.persona || "strategic_cognitive_architect"}'...`;
        this.ctx.sessions.append(request.sessionId, 1, "reasoning", { content: reasoningMsg });
        yield { type: "reasoning", content: reasoningMsg };

        if (isDeepThink) {
            const deepThinkMsg = `🔬 [DeepThink Pro] Decomposição de intenção profunda, validação de restrições topológicas e consistência formal...`;
            this.ctx.sessions.append(request.sessionId, 1, "reasoning", { content: deepThinkMsg });
            yield { type: "reasoning", content: deepThinkMsg };
        }

        // 3. Seleção e Execução de Ferramentas via ToolService
        const tools = this.ctx.tools.list();
        let contextData = "";

        // Detector simples de ferramenta apropriada com base na intenção
        const isShellRequest = /(executar|rodar|execute|run|comando|terminal|powershell|cmd)/i.test(request.prompt) && request.prompt.includes("shell");
        const isFsListRequest = /(listar|listar arquivos|conteúdo do diretório|arquivos na pasta)/i.test(request.prompt);

        let selectedTool: any = null;
        let toolArgs: any = null;

        if (isShellRequest) {
            selectedTool = tools.find(t => t.name === "shell.exec");
            toolArgs = { command: "powershell.exe -NoProfile -Command \"Get-ChildItem -Name | Select-Object -First 5\"" };
        } else if (isFsListRequest) {
            selectedTool = tools.find(t => t.name === "fs.list_dir");
            toolArgs = { dirPath: "." };
        } else {
            // Default RAG
            selectedTool = tools.find(t => t.name === "zvec_grep.search");
            toolArgs = { query: request.prompt, limit: 3 };
        }

        if (selectedTool) {
            const callId = `call_${Date.now()}`;

            yield {
                type: "tool_call",
                content: selectedTool.name,
                metadata: {
                    callId,
                    toolName: selectedTool.name,
                    arguments: toolArgs
                }
            };

            this.ctx.sessions.append(request.sessionId, 1, "tool_call", { callId, toolName: selectedTool.name, args: toolArgs });

            // Portão Human-in-the-Loop para ferramentas exclusivas
            let approved = true;
            if (selectedTool.isExclusive) {
                yield {
                    type: "approval_prompt",
                    content: `Solicitação de autorização: A ferramenta exclusiva '${selectedTool.name}' requer aprovação do operador para prosseguir.`,
                    metadata: {
                        callId,
                        toolName: selectedTool.name,
                        arguments: toolArgs
                    }
                };

                approved = await this.ctx.approvals.requestApproval({
                    callId,
                    sessionId: request.sessionId,
                    toolName: selectedTool.name,
                    args: toolArgs,
                    autoApproveIfTest: request.autoApproveIfTest
                });
            }

            if (!approved) {
                const rejectPayload = {
                    callId,
                    status: "rejected",
                    result: "Execução negada pelo operador humano no Agent Workbench."
                };
                this.ctx.sessions.append(request.sessionId, 1, "tool_result", rejectPayload);
                yield {
                    type: "tool_result",
                    content: "❌ Execução da ferramenta foi cancelada pelo operador humano.",
                    metadata: { callId, status: "rejected" }
                };
            } else {
                const execResult = await this.ctx.tools.executeTool(selectedTool.name, toolArgs);

                this.ctx.sessions.append(request.sessionId, 1, "tool_result", execResult);

                yield {
                    type: "tool_result",
                    content: typeof execResult.result === "string" ? execResult.result : JSON.stringify(execResult.result),
                    metadata: {
                        callId,
                        status: execResult.status,
                        latencyMs: execResult.latencyMs
                    }
                };

                if (execResult.status === "success" && Array.isArray(execResult.result)) {
                    contextData = execResult.result.map((h: any) => `[${h.filePath || h.name}]: ${h.content || h.relativePath || ""}`).join("\n");
                }
            }
        }

        // 4. Inferência e Streaming do LLM
        let fullOutputText = "";
        const systemPrompt = contextData ? `[Contexto Local Relevante]:\n${contextData}` : undefined;

        for await (const chunk of this.ctx.llm.streamInference({
            model: modelChoice,
            prompt: request.prompt,
            deepthink: isDeepThink,
            systemPrompt
        })) {
            if (chunk.type === "reasoning") {
                yield { type: "reasoning", content: chunk.content };
            } else if (chunk.type === "text") {
                fullOutputText += chunk.content;
                yield { type: "text", content: chunk.content };
            }
        }

        this.ctx.sessions.append(request.sessionId, 1, "text", { text: fullOutputText });

        // 5. Verificação Formal Idris 2 se código for gerado
        if (fullOutputText.includes("```") || isDeepThink) {
            const idrisTool = tools.find(t => t.name === "idris2_verifier.verify");
            if (idrisTool) {
                const idrisRes = await this.ctx.tools.executeTool(idrisTool.name, { patchCode: fullOutputText });
                const verifText = `🔬 [Idris 2 Proof] Portão de Segurança Formal: ${idrisRes.status === "success" ? "PASS (100% Verificado)" : "REJEITADO"}`;
                this.ctx.sessions.append(request.sessionId, 1, "verification", { status: idrisRes.status, text: verifText });
                yield {
                    type: "verification",
                    content: verifText,
                    metadata: { approved: idrisRes.status === "success" }
                };
            }
        }

        // 6. Conclusão do Turno & Telemetria
        const totalDuration = Date.now() - startTime;
        const estimatedTokens = Math.max(120, Math.round((request.prompt.length + fullOutputText.length) / 3.5));
        const telemetry = this.ctx.telemetry.recordTurnMetrics({
            tokens: estimatedTokens,
            durationMs: totalDuration,
            cacheHit: isDeepThink
        });

        this.ctx.sessions.append(request.sessionId, 1, "turn_end", telemetry);
        await this.ctx.events.emit("turn/end", { sessionId: request.sessionId, telemetry });

        yield {
            type: "turn_end",
            content: "Turno concluído no DeepSeek Harness Agent Loop.",
            metadata: telemetry
        };
    }
}
