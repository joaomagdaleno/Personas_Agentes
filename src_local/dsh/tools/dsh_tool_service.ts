import type { DshContext } from "../kernel/dsh_context.ts";

export interface DshToolDefinition {
    name: string;
    description: string;
    schema?: Record<string, any>;
    isExclusive?: boolean; // Se true, roda em barreira exclusiva; se false, roda no pool paralelo
    execute: (args: any, ctx: DshContext) => Promise<any>;
}

export class DshToolService {
    private tools: Map<string, DshToolDefinition> = new Map();
    private ctx: DshContext;

    constructor(ctx: DshContext) {
        this.ctx = ctx;
    }

    /**
     * Registra uma nova ferramenta no ecossistema DSH
     */
    public register(tool: DshToolDefinition): void {
        this.tools.set(tool.name, tool);
    }

    /**
     * Retorna a lista de todas as ferramentas disponíveis
     */
    public list(): DshToolDefinition[] {
        return Array.from(this.tools.values());
    }

    /**
     * Obtém uma ferramenta pelo nome
     */
    public get(name: string): DshToolDefinition | undefined {
        return this.tools.get(name);
    }

    /**
     * Executa uma chamada de ferramenta passando pelos hooks de segurança e verificação
     */
    public async executeTool(name: string, args: any): Promise<{ status: "success" | "error"; result: any; latencyMs: number }> {
        const tool = this.tools.get(name);
        if (!tool) {
            throw new Error(`[DSH ToolService] Ferramenta '${name}' não encontrada no registro.`);
        }

        const start = Date.now();

        // 1. Hook tools/pre-execute (Validação de segurança, rate limit, anti-injeção)
        await this.ctx.events.emit("tools/pre-execute", { toolName: name, args });

        const allowed = await this.ctx.events.runWaterfall(
            "tools/pre-execute",
            { toolName: name, args },
            async () => true
        );

        if (!allowed) {
            throw new Error(`[DSH ToolService] Execução da ferramenta '${name}' foi bloqueada pelo portão de segurança (tools/pre-execute).`);
        }

        try {
            // 2. Execução da ferramenta propriamente dita
            const rawResult = await tool.execute(args, this.ctx);
            const latencyMs = Date.now() - start;

            // 3. Hook tools/post-execute (Validação formal matemática Idris 2, auditoria AST, sanitização)
            const postResult = await this.ctx.events.runWaterfall(
                "tools/post-execute",
                { toolName: name, args, result: rawResult, latencyMs },
                async () => rawResult
            );

            return {
                status: "success",
                result: postResult,
                latencyMs
            };
        } catch (error: any) {
            return {
                status: "error",
                result: error.message || String(error),
                latencyMs: Date.now() - start
            };
        }
    }
}
