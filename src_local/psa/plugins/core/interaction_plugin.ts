import type { PsaPlugin } from "../../kernel/psa_plugin.ts";
import type { PsaContext } from "../../kernel/psa_context.ts";

export class InteractionPlugin implements PsaPlugin {
    public name = "psa-plugin-interaction";
    public version = "1.0.0";
    public description = "Gerenciador de interação humana com o operador, perguntas de múltipla escolha e aprovações.";

    public apply(ctx: PsaContext): void {
        ctx.tools.register({
            name: "interaction.ask_question",
            description: "Apresenta uma pergunta estruturada com opções de múltipla escolha para o usuário no PSA Agent Workbench.",
            schema: {
                type: "object",
                properties: {
                    question: { type: "string", description: "Texto da pergunta para o usuário" },
                    options: {
                        type: "array",
                        items: { type: "string" },
                        description: "Lista de opções selecionáveis"
                    },
                    allowCustomAnswer: { type: "boolean", description: "Permitir resposta livre" }
                },
                required: ["question", "options"]
            },
            isExclusive: false,
            execute: async (args: { question: string; options: string[]; allowCustomAnswer?: boolean }) => {
                await ctx.events.emit("interaction/question_prompt", {
                    question: args.question,
                    options: args.options,
                    allowCustomAnswer: args.allowCustomAnswer ?? true,
                    timestamp: new Date().toISOString()
                });

                return {
                    status: "question_presented",
                    question: args.question,
                    options: args.options,
                    awaitingUserChoice: true
                };
            }
        });
    }
}
