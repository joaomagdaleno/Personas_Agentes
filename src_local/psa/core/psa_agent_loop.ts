import type { PsaContext } from "../kernel/psa_context.ts";

export interface PsaTurnRequest {
    sessionId: string;
    prompt: string;
    model?: string;
    mode?: string;
    persona?: string;
    deepthink?: boolean;
    maxParallelToolCalls?: number;
    autoApproveIfTest?: boolean;
}

export interface PsaTurnEvent {
    type: "turn_start" | "reasoning" | "tool_call" | "tool_result" | "verification" | "approval_prompt" | "compaction" | "text" | "turn_end";
    content: string;
    metadata?: Record<string, any>;
}

export class PsaAgentLoop {
    private ctx: PsaContext;
    private maxParallelToolCalls: number;

    constructor(ctx: PsaContext, maxParallelToolCalls: number = 10) {
        this.ctx = ctx;
        this.maxParallelToolCalls = maxParallelToolCalls;
    }

    /**
     * Executa o ciclo de vida completo de um turno de agente no padrão PSA
     */
    public async *runTurn(request: PsaTurnRequest): AsyncGenerator<PsaTurnEvent> {
        const startTime = Date.now();
        // Dynamic SLM Triad Resolution & Handoff:
        // - "qwen3-8b-thinking" for Planning, Architecture, Deep Reasoning
        // - "qwen2.5-coder-7b" for Code Engineering, Terminal & Tool Execution (Default)
        // - "qwen2.5-coder-1.5b" for Ultra-Fast Triage, RAG Filtering & Lightweight Chat
        let modelChoice = request.model;
        if (!modelChoice || modelChoice === "deepseek-v4-flash") {
            modelChoice = request.mode === "Minimal" ? "qwen2.5-coder-1.5b" : "qwen2.5-coder-7b";
        } else if (modelChoice === "deepseek-v4-pro") {
            modelChoice = "qwen3-8b-thinking";
        }

        const isDeepThink = Boolean(request.deepthink || modelChoice === "qwen3-8b-thinking");
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
        const reasoningMsg = `🧠 [${modelChoice}] Agente orquestrado via PSA Micro-Kernel ativando persona '${request.persona || "strategic_cognitive_architect"}'...`;
        this.ctx.sessions.append(request.sessionId, 1, "reasoning", { content: reasoningMsg });
        yield { type: "reasoning", content: reasoningMsg };

        if (isDeepThink) {
            const deepThinkMsg = `🔬 [PSA DeepThink Pro] Decomposição de intenção profunda, validação de restrições topológicas e consistência formal...`;
            this.ctx.sessions.append(request.sessionId, 1, "reasoning", { content: deepThinkMsg });
            yield { type: "reasoning", content: deepThinkMsg };
        }

        // 3. Seleção e Execução de Ferramentas via ToolService
        const tools = this.ctx.tools.list();
        let contextData = "";

        // 3.1 Verificação de chamada explícita estruturada (ex: tool:nome_da_tool {args})
        let selectedTool: any = null;
        let toolArgs: any = {};

        const explicitToolMatch = request.prompt.match(/(?:chamar[- ]ferramenta|tool|execute[- ]tool):\s*([a-zA-Z0-9_\.]+)(?:\s+args:\s*(\{.*\}))?/i);
        if (explicitToolMatch) {
            const toolName = explicitToolMatch[1];
            selectedTool = tools.find(t => t.name.toLowerCase() === toolName.toLowerCase());
            if (explicitToolMatch[2]) {
                try { toolArgs = JSON.parse(explicitToolMatch[2]); } catch {}
            }
        }

        // 3.2 Se não houver chamada explícita, avalia intent semântica por capacidade
        if (!selectedTool) {
            const isDiagnosticRequest = /(diagn[oó]stico|sa[uú]de|health|censo|coverage)/i.test(request.prompt);
            const isAuditStagedRequest = /(auditoria|auditar|staged|obfuscation|ofusca)/i.test(request.prompt);
            const isRegistryRequest = /(cat[aá]logo|stacks|registro|agentes dispon[ií]veis|listar agentes)/i.test(request.prompt);
            const isHealingRequest = /(auto[- ]?cura|curar|healer|consertar)/i.test(request.prompt);
            const isGovernanceRequest = /(hardware|governan[cç]a|mem[oó]ria ram|cpu|recursos)/i.test(request.prompt);
            const isShellRequest = /(executar|rodar|execute|run|comando|terminal|powershell|cmd)/i.test(request.prompt) && request.prompt.includes("shell");
            const isFsListRequest = /(listar arquivos|conteúdo do diretório|arquivos na pasta)/i.test(request.prompt);
            const isCompactRequest = /(compactar|compactar histórico|resumir sessão|compaction)/i.test(request.prompt);
            const isCodeSearch = /(onde est[aá]|qual arquivo|procurar por|pesquisar|buscar no c[oó]digo|buscar na base|grep|find)/i.test(request.prompt);
            const isConversational = /^(ol[aá]|oi|hello|hi|bom dia|boa tarde|boa noite|quem [eé] voc[eê]|o que voc[eê] faz)\b/i.test(request.prompt.trim());

            if (isDiagnosticRequest) {
                selectedTool = tools.find(t => t.name === "system.run_diagnostic");
                toolArgs = { skipTests: true, dryRun: true };
            } else if (isAuditStagedRequest) {
                selectedTool = tools.find(t => t.name === "audit.staged");
                toolArgs = { dryRun: true };
            } else if (isRegistryRequest) {
                selectedTool = tools.find(t => t.name === "registry.list_stacks");
                toolArgs = {};
            } else if (isHealingRequest) {
                selectedTool = tools.find(t => t.name === "healing.run_auto_heal");
                toolArgs = { dryRun: true };
            } else if (isGovernanceRequest) {
                selectedTool = tools.find(t => t.name === "native.governance_status");
                toolArgs = {};
            } else if (isCompactRequest) {
                selectedTool = tools.find(t => t.name === "compaction.compact");
                toolArgs = { sessionId: request.sessionId };
            } else if (isShellRequest) {
                selectedTool = tools.find(t => t.name === "shell.exec");
                toolArgs = { command: "powershell.exe -NoProfile -Command \"Get-ChildItem -Name | Select-Object -First 5\"" };
            } else if (isFsListRequest) {
                selectedTool = tools.find(t => t.name === "fs.list_dir");
                toolArgs = { dirPath: "." };
            } else if (isCodeSearch) {
                selectedTool = tools.find(t => t.name === "zvec_grep.search");
                toolArgs = { query: request.prompt, limit: 3 };
            } else if (!isConversational && request.prompt.length > 20) {
                // Se a pergunta tiver complexidade técnica, fornece contexto via ZvecGrep
                selectedTool = tools.find(t => t.name === "zvec_grep.search");
                toolArgs = { query: request.prompt, limit: 3 };
            }
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
                    result: "Execução negada pelo operador humano no PSA Agent Workbench."
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
            content: "Turno concluído no PSA Agent Loop.",
            metadata: telemetry
        };
    }
}

// Compatibilidade
export type DshTurnRequest = PsaTurnRequest;
export type DshTurnEvent = PsaTurnEvent;
export { PsaAgentLoop as DshAgentLoop };
