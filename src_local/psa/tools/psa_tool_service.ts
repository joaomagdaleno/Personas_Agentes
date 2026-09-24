import type { PsaContext } from "../kernel/psa_context.ts";

export interface PsaToolDefinition {
    name: string;
    description: string;
    schema: Record<string, any>;
    isExclusive?: boolean;
    execute: (args: any, ctx: PsaContext) => Promise<any>;
}

export class PsaToolService {
    private tools: Map<string, PsaToolDefinition> = new Map();
    private ctx: PsaContext;

    constructor(ctx: PsaContext) {
        this.ctx = ctx;
    }

    public register(tool: PsaToolDefinition): void {
        this.tools.set(tool.name, tool);
    }

    public unregister(name: string): boolean {
        return this.tools.delete(name);
    }

    public list(): PsaToolDefinition[] {
        return Array.from(this.tools.values());
    }

    public get(name: string): PsaToolDefinition | undefined {
        return this.tools.get(name);
    }

    public has(name: string): boolean {
        return this.tools.has(name);
    }

    /**
     * Executa uma chamada de ferramenta passando pelos hooks de segurança e verificação
     */
    public async executeTool(name: string, args: any): Promise<{ status: "success" | "error"; result: any; latencyMs: number }> {
        const tool = this.tools.get(name);
        if (!tool) {
            throw new Error(`[PSA ToolService] Ferramenta '${name}' não encontrada no registro.`);
        }

        // ⚡ Bolt Optimization: Use high-precision performance.now() monotonic clock
        const start = performance.now();

        // 1. Hook tools/pre-execute
        await this.ctx.events.emit("tools/pre-execute", { toolName: name, args });

        // ⚡ Bolt Optimization: Fast-path bypass closure and Promise allocation when no waterfall hooks are attached
        if (this.ctx.events.hasWaterfall("tools/pre-execute")) {
            const allowed = await this.ctx.events.runWaterfall(
                "tools/pre-execute",
                { toolName: name, args },
                async () => true
            );

            if (!allowed) {
                throw new Error(`[PSA ToolService] Execução da ferramenta '${name}' foi bloqueada pelo portão de segurança (tools/pre-execute).`);
            }
        }

        try {
            // 2. Execução da ferramenta propriamente dita
            const rawResult = await tool.execute(args, this.ctx);
            const latencyMs = Math.round(performance.now() - start);

            // 3. Hook tools/post-execute
            let postResult = rawResult;
            if (this.ctx.events.hasWaterfall("tools/post-execute")) {
                postResult = await this.ctx.events.runWaterfall(
                    "tools/post-execute",
                    { toolName: name, args, result: rawResult, latencyMs },
                    async () => rawResult
                );
            }

            return {
                status: "success",
                result: postResult,
                latencyMs
            };
        } catch (error: any) {
            return {
                status: "error",
                result: error.message || String(error),
                latencyMs: Math.round(performance.now() - start)
            };
        }
    }
}

// Compatibilidade
export type DshToolDefinition = PsaToolDefinition;
export { PsaToolService as DshToolService };
