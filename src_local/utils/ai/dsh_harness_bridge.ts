import winston from "winston";
import { ZvecGrepEngine } from "../zvec/zvec_grep_engine.ts";
import { DualAPIEngine } from "./dual_api_engine.ts";
import { FormalVerificationEngine } from "../../engines/healing/formal_verification_engine.ts";

const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || "info",
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message }) => `${timestamp} - DSHBridge - ${level.toUpperCase()} - ${message}`)
    ),
    transports: [new winston.transports.Console()]
});

export interface DSHSessionConfig {
    sessionId: string;
    workspaceRoot: string;
    activePersonaKey: string;
    modelRoute: string;
}

export interface DSHStreamMessage {
    type: "reasoning" | "text" | "tool_call" | "approval_prompt" | "error";
    content: string;
    metadata?: Record<string, any>;
}

/**
 * 🐉 DeepSeek Harness (DSH) Bridge
 *
 * Adapta o protocolo e eventos de MUX Stream do DeepSeek Harness (dsh web)
 * para a arquitetura soberana das 8 Super Personas do projeto Personas_Agentes.
 */
export class DSHHarnessBridge {
    private static instance: DSHHarnessBridge;
    private sessions: Map<string, DSHSessionConfig> = new Map();

    public static getInstance(): DSHHarnessBridge {
        if (!DSHHarnessBridge.instance) {
            DSHHarnessBridge.instance = new DSHHarnessBridge();
        }
        return DSHHarnessBridge.instance;
    }

    /**
     * Creates a new DSH workspace session connected to the Super Personas
     */
    public createSession(config: DSHSessionConfig): DSHSessionConfig {
        this.sessions.set(config.sessionId, config);
        logger.info(`🐉 [DSH Bridge] Sessão DeepSeek Harness iniciada: ${config.sessionId} (Persona: ${config.activePersonaKey})`);
        return config;
    }

    /**
     * Process prompt through DSH protocol with ZvecGrep RAG enrichment and Idris 2 formal safety checks
     */
    public async *streamChat(sessionId: string, prompt: string): AsyncGenerator<DSHStreamMessage> {
        const session = this.sessions.get(sessionId) || {
            sessionId,
            workspaceRoot: process.cwd(),
            activePersonaKey: "strategic_cognitive_architect",
            modelRoute: "unified_dual_api"
        };

        // 1. Emit Collapsible Reasoning stream (DSH Protocol)
        yield {
            type: "reasoning",
            content: `🧠 [DSH Stream] Ancorando contexto para a Super Persona '${session.activePersonaKey}'...`
        };

        // 2. Query ZvecGrepEngine for RAG Anchors
        let contextSnippets = "";
        try {
            const zg = ZvecGrepEngine.getInstance(session.workspaceRoot);
            const hits = await zg.search(prompt, 3);
            if (hits.length > 0) {
                contextSnippets = hits.map(h => `[${h.filePath}]: ${h.content}`).join("\n");
                yield {
                    type: "reasoning",
                    content: `🔍 [ZvecGrep Anchor] Encontrados ${hits.length} trechos relevantes de código.`
                };
            }
        } catch (err: any) {
            logger.debug(`[DSH Bridge] ZvecGrep anchor fallback: ${err.message}`);
        }

        // 3. Generate response via DualAPI / Local Model
        const fullPrompt = contextSnippets ? `${prompt}\n\n[Contexto da Base]:\n${contextSnippets}` : prompt;
        const dualApi = DualAPIEngine.getInstance();

        yield {
            type: "reasoning",
            content: `⚡ [DualAPI] Processando raciocínio via Gemini / HuggingFace / WarmPurge GGUF...`
        };

        const res = await dualApi.generate(fullPrompt, { temperature: 0.2, maxTokens: 1024 });

        // 4. Check if patch auto-healing is suggested and run Idris 2 Formal Verification
        if (res.text.includes("```") || res.text.includes("DELETE FROM") || res.text.includes("UPDATE ")) {
            const formalVerifier = FormalVerificationEngine.getInstance();
            const formalReport = formalVerifier.verifyPatch(res.text, "dsh_patch_proposal.ts");

            yield {
                type: "approval_prompt",
                content: `🔬 [Idris 2 Formal Proof] Patch Proposto: ${formalReport.approved ? "APROVADO" : "REJEITADO"} pelas provas matemáticas formais.`,
                metadata: {
                    approved: formalReport.approved,
                    contracts: formalReport.contracts
                }
            };
        }

        // 5. Stream final text output
        yield {
            type: "text",
            content: res.text || "Resposta gerada pelas Super Personas."
        };
    }
}
