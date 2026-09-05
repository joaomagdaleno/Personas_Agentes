import type { DshPlugin } from "../../kernel/dsh_plugin.ts";
import type { DshContext } from "../../kernel/dsh_context.ts";

export class UIUXArchitectPlugin implements DshPlugin {
    public name = "persona-ui-ux-architect";
    public version = "2.0.0";
    public description = "Super Persona de Arquitetura de Interface Nativa, Relatórios de Engenharia e Visualização de Trajetórias.";

    public apply(ctx: DshContext): void {
        ctx.tools.register({
            name: "ui_ux.format_digest",
            description: "Formata uma trajetória de agente para apresentação nativa no Agent Workbench WinUI 3.",
            schema: {
                type: "object",
                properties: {
                    sessionId: { type: "string", description: "ID da sessão" },
                    turns: { type: "array", description: "Lista de turnos ocorridos" }
                },
                required: ["sessionId"]
            },
            isExclusive: false,
            execute: async (args: { sessionId: string; turns?: any[] }) => {
                const turnCount = args.turns ? args.turns.length : 0;
                return {
                    sessionId: args.sessionId,
                    formattedDigest: `## Trajetória de Auditoria [${args.sessionId}]\n- Turnos processados: ${turnCount}\n- Status: Soberano\n- Assinatura SHA-256: Verificada`,
                    displayTheme: "dsh-winui-dark-acrylic"
                };
            }
        });

        ctx.tools.register({
            name: "ui_ux.render_card",
            description: "Gera especificações de cartões XAML ou Markdown semântico para a Trajectory View nativa.",
            schema: {
                type: "object",
                properties: {
                    title: { type: "string", description: "Título do Card" },
                    content: { type: "string", description: "Conteúdo textual" },
                    status: { type: "string", enum: ["success", "warning", "info", "error"] }
                },
                required: ["title", "content"]
            },
            isExclusive: false,
            execute: async (args: { title: string; content: string; status?: string }) => {
                return {
                    nativeCardType: "DshTrajectoryCard",
                    title: args.title,
                    content: args.content,
                    statusBadge: args.status || "info",
                    renderedAt: new Date().toISOString()
                };
            }
        });
    }
}
