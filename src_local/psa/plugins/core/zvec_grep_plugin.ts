import { ZvecGrepEngine } from "../../../utils/zvec/zvec_grep_engine.ts";
import type { PsaPlugin } from "../../kernel/psa_plugin.ts";
import type { PsaContext } from "../../kernel/psa_context.ts";

export class ZvecGrepPlugin implements PsaPlugin {
    public name = "psa-plugin-zvec-grep";
    public version = "1.0.0";
    public description = "Motor de busca vetorial SIMD ultra-rápido para recuperação RAG local.";

    public apply(ctx: PsaContext): void {
        ctx.tools.register({
            name: "zvec_grep.search",
            description: "Busca semântica e vetorial em alta velocidade no repositório de código.",
            schema: {
                type: "object",
                properties: {
                    query: { type: "string", description: "Termo de busca ou pergunta sobre o código" },
                    limit: { type: "number", description: "Número máximo de resultados" }
                },
                required: ["query"]
            },
            isExclusive: false,
            execute: async (args: { query: string; limit?: number }) => {
                const zg = ZvecGrepEngine.getInstance(ctx.workspaceRoot);
                const hits = await zg.search(args.query, args.limit || 3);
                return hits.map(h => ({ filePath: h.filePath, content: h.content, score: h.score }));
            }
        });
    }
}
