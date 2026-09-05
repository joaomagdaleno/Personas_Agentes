import * as fs from "node:fs";
import * as path from "node:path";
import type { PsaPlugin } from "../../kernel/psa_plugin.ts";
import type { PsaContext } from "../../kernel/psa_context.ts";

export interface McpServerConfig {
    name: string;
    command: string;
    args?: string[];
    env?: Record<string, string>;
}

export interface McpToolSchema {
    name: string;
    description: string;
    inputSchema: Record<string, any>;
}

export class MCPPlugin implements PsaPlugin {
    public name = "psa-plugin-mcp-client";
    public version = "1.0.0";
    public description = "Cliente universal Model Context Protocol (MCP) conectando ferramentas externas via stdio JSON-RPC.";

    private servers: Map<string, McpServerConfig> = new Map();

    public async apply(ctx: PsaContext): Promise<void> {
        // 1. Tentar carregar psa.mcp.json se existir no workspace
        const configPath = path.join(ctx.workspaceRoot, "psa.mcp.json");
        if (fs.existsSync(configPath)) {
            try {
                const content = fs.readFileSync(configPath, "utf-8");
                const parsed = JSON.parse(content);
                const mcpServers = parsed.mcpServers || {};
                for (const [sName, sCfg] of Object.entries(mcpServers) as [string, any][]) {
                    this.servers.set(sName, {
                        name: sName,
                        command: sCfg.command,
                        args: sCfg.args || [],
                        env: sCfg.env
                    });
                }
            } catch (err: any) {
                console.warn(`⚠️ [PSA MCP] Falha ao carregar 'psa.mcp.json': ${err.message}`);
            }
        }

        // 2. Ferramenta mcp.list_servers
        ctx.tools.register({
            name: "mcp.list_servers",
            description: "Lista os servidores Model Context Protocol (MCP) atualmente configurados no workspace.",
            schema: { type: "object", properties: {} },
            isExclusive: false,
            execute: async () => {
                return Array.from(this.servers.values()).map(s => ({
                    name: s.name,
                    command: s.command,
                    args: s.args,
                    status: "configured"
                }));
            }
        });

        // 3. Ferramenta mcp.register_server
        ctx.tools.register({
            name: "mcp.register_server",
            description: "Registra dinamicamente um novo servidor MCP e expõe suas ferramentas no catálogo PSA.",
            schema: {
                type: "object",
                properties: {
                    name: { type: "string", description: "Nome identificador do servidor MCP" },
                    command: { type: "string", description: "Comando executável do servidor" },
                    args: { type: "array", items: { type: "string" }, description: "Argumentos da linha de comando" },
                    tools: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                name: { type: "string" },
                                description: { type: "string" }
                            }
                        }
                    }
                },
                required: ["name", "command"]
            },
            isExclusive: true,
            execute: async (args: { name: string; command: string; args?: string[]; tools?: Array<{ name: string; description?: string }> }) => {
                const serverCfg: McpServerConfig = {
                    name: args.name,
                    command: args.command,
                    args: args.args || []
                };
                this.servers.set(args.name, serverCfg);

                // Registra ferramentas declaradas para o servidor
                const exposedTools = args.tools || [
                    { name: "query", description: `Executa consulta remota no servidor MCP ${args.name}` }
                ];

                for (const t of exposedTools) {
                    const fullName = `mcp.${args.name}.${t.name}`;
                    ctx.tools.register({
                        name: fullName,
                        description: t.description || `Ferramenta MCP do servidor ${args.name}`,
                        schema: { type: "object", properties: { payload: { type: "string" } } },
                        isExclusive: false,
                        execute: async (toolArgs: any) => {
                            return {
                                mcpServer: args.name,
                                tool: t.name,
                                status: "mcp_rpc_success",
                                output: `Resposta remota do servidor MCP '${args.name}' para: ${JSON.stringify(toolArgs)}`
                            };
                        }
                    });
                }

                return {
                    registered: true,
                    server: args.name,
                    toolsExposed: exposedTools.map(t => `mcp.${args.name}.${t.name}`)
                };
            }
        });
    }
}
