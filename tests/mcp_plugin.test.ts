import { describe, it, expect, beforeEach } from "bun:test";
import { PsaContext } from "../src_local/psa/kernel/psa_context.ts";
import { MCPPlugin } from "../src_local/psa/plugins/core/mcp_plugin.ts";

/**
 * Component Under Test: src_local/psa/plugins/core/mcp_plugin.ts
 * Layer: Micro-Kernel Core Plugins / Model Context Protocol (MCP) Client
 * Pattern: Arrange-Act-Assert (AAA)
 */
describe("MCPPlugin Unit Tests", () => {
    let ctx: PsaContext;

    beforeEach(async () => {
        ctx = new PsaContext(process.cwd());
        const plugin = new MCPPlugin();
        await plugin.apply(ctx);
        ctx.plugins.register(plugin);
    });

    it("should register mcp.list_servers and mcp.register_server tools in PsaContext", () => {
        // Arrange
        const registeredTools = ctx.tools.list();
        const toolNames = registeredTools.map(t => t.name);

        // Assert
        expect(toolNames).toContain("mcp.list_servers");
        expect(toolNames).toContain("mcp.register_server");
    });

    it("should list configured MCP servers via mcp.list_servers tool", async () => {
        // Act
        const result = await ctx.tools.executeTool("mcp.list_servers", {});

        // Assert
        expect(result.status).toBe("success");
        expect(Array.isArray(result.result)).toBe(true);
    });

    it("should dynamically register new MCP server and expose its tools via mcp.register_server", async () => {
        // Arrange
        const serverName = "github-mcp";
        const command = "npx";
        const args = ["-y", "@modelcontextprotocol/server-github"];
        const tools = [
            { name: "search_repositories", description: "Procura repositórios no GitHub" },
            { name: "get_issue", description: "Obtém detalhes de uma issue" }
        ];

        // Act
        const regResult = await ctx.tools.executeTool("mcp.register_server", {
            name: serverName,
            command,
            args,
            tools
        });

        // Assert
        expect(regResult.status).toBe("success");
        const regData = regResult.result as { registered: boolean; server: string; toolsExposed: string[] };
        expect(regData.registered).toBe(true);
        expect(regData.server).toBe(serverName);
        expect(regData.toolsExposed).toContain("mcp.github-mcp.search_repositories");
        expect(regData.toolsExposed).toContain("mcp.github-mcp.get_issue");

        // Verify newly registered MCP tool exists in PsaContext
        const toolNames = ctx.tools.list().map(t => t.name);
        expect(toolNames).toContain("mcp.github-mcp.search_repositories");

        // Act - Execute newly registered MCP tool
        const toolExecResult = await ctx.tools.executeTool("mcp.github-mcp.search_repositories", { payload: "PersonasAgentes" });

        // Assert
        expect(toolExecResult.status).toBe("success");
        expect((toolExecResult.result as any).mcpServer).toBe(serverName);
        expect((toolExecResult.result as any).tool).toBe("search_repositories");
        expect((toolExecResult.result as any).status).toBe("mcp_rpc_success");
    });
});
