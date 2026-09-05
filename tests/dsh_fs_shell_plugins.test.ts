import { describe, it, expect, beforeEach } from "bun:test";
import * as path from "node:path";
import * as fs from "node:fs";
import { DshContext } from "../src_local/dsh/kernel/dsh_context.ts";
import { FSPlugin } from "../src_local/dsh/plugins/core/fs_plugin.ts";
import { ShellPlugin } from "../src_local/dsh/plugins/core/shell_plugin.ts";
import { InteractionPlugin } from "../src_local/dsh/plugins/core/interaction_plugin.ts";

describe("DeepSeek Harness — FS, Shell & Human-in-the-Loop Plugins", () => {
    let ctx: DshContext;

    beforeEach(() => {
        ctx = DshContext.getInstance(process.cwd());
        ctx.use(new FSPlugin());
        ctx.use(new ShellPlugin());
        ctx.use(new InteractionPlugin());
    });

    it("deve registrar as ferramentas de FS, Shell e Interaction no DshToolService", () => {
        const tools = ctx.tools.list();
        const names = tools.map(t => t.name);

        expect(names).toContain("fs.read_file");
        expect(names).toContain("fs.write_file");
        expect(names).toContain("fs.edit_file");
        expect(names).toContain("fs.list_dir");
        expect(names).toContain("shell.exec");
        expect(names).toContain("interaction.ask_question");
    });

    it("deve criar, ler com paginação e editar arquivos de forma atômica via FSPlugin", async () => {
        const testFilePath = "tmp_fs_test_file.txt";
        const initialContent = "Linha 1: Introdução\nLinha 2: DeepSeek Harness\nLinha 3: WinUI Nativo\nLinha 4: Conclusão";

        // 1. fs.write_file
        const writeRes = await ctx.tools.executeTool("fs.write_file", {
            filePath: testFilePath,
            content: initialContent,
            overwrite: true
        });
        expect(writeRes.status).toBe("success");
        expect(writeRes.result.bytesWritten).toBeGreaterThan(0);

        // 2. fs.read_file (com paginação: linhas 2 a 3)
        const readRes = await ctx.tools.executeTool("fs.read_file", {
            filePath: testFilePath,
            startLine: 2,
            endLine: 3
        });
        expect(readRes.status).toBe("success");
        expect(readRes.result.startLine).toBe(2);
        expect(readRes.result.endLine).toBe(3);
        expect(readRes.result.content).toBe("Linha 2: DeepSeek Harness\nLinha 3: WinUI Nativo");

        // 3. fs.edit_file
        const editRes = await ctx.tools.executeTool("fs.edit_file", {
            filePath: testFilePath,
            targetContent: "DeepSeek Harness",
            replacementContent: "DeepSeek Harness Sovereign Edition"
        });
        expect(editRes.status).toBe("success");
        expect(editRes.result.status).toBe("edited");

        // 4. fs.list_dir
        const listRes = await ctx.tools.executeTool("fs.list_dir", { dirPath: "." });
        expect(listRes.status).toBe("success");
        expect(listRes.result.count).toBeGreaterThan(0);

        // Limpeza
        const fullTestPath = path.resolve(ctx.workspaceRoot, testFilePath);
        if (fs.existsSync(fullTestPath)) {
            fs.unlinkSync(fullTestPath);
        }
    });

    it("deve bloquear violações de path traversal fora do workspaceRoot no FSPlugin", async () => {
        const traversalTarget = "../../../../../../../Windows/System32/drivers/etc/hosts";
        const res = await ctx.tools.executeTool("fs.read_file", { filePath: traversalTarget });

        expect(res.status).toBe("error");
        expect(String(res.result)).toContain("viola os limites do workspace");
    });

    it("deve executar comando nativo via ShellPlugin e capturar stdout/exitCode", async () => {
        const res = await ctx.tools.executeTool("shell.exec", {
            command: "echo 'DSH_SOVEREIGN_SHELL_OK'"
        });

        expect(res.status).toBe("success");
        expect(res.result.exitCode).toBe(0);
        expect(res.result.stdout).toContain("DSH_SOVEREIGN_SHELL_OK");
        expect(res.result.durationMs).toBeGreaterThan(0);
    });

    it("deve orquestrar ciclo de vida de aprovação humana com DshApprovalManager", async () => {
        const callId = `call_test_approval_${Date.now()}`;

        // Dispara requisição de aprovação em background
        const approvalPromise = ctx.approvals.requestApproval({
            callId,
            sessionId: "test_ses_hil",
            toolName: "shell.exec",
            args: { command: "rm -rf /" }
        });

        // Verifica que ficou pendente
        const pending = ctx.approvals.getPending();
        expect(pending.some(p => p.callId === callId)).toBe(true);

        // Operador humano resolve (Aprova)
        const resolved = ctx.approvals.resolveApproval(callId, true);
        expect(resolved).toBe(true);

        const result = await approvalPromise;
        expect(result).toBe(true);

        // Verifica que não está mais pendente
        expect(ctx.approvals.getPending().some(p => p.callId === callId)).toBe(false);
    });

    it("deve apresentar perguntas interativas via InteractionPlugin", async () => {
        let questionEventReceived = false;
        ctx.events.on("interaction/question_prompt", async () => {
            questionEventReceived = true;
        });

        const res = await ctx.tools.executeTool("interaction.ask_question", {
            question: "Qual modelo DeepSeek V4 deseja usar?",
            options: ["deepseek-v4-flash", "deepseek-v4-pro"]
        });

        expect(res.status).toBe("success");
        expect(res.result.awaitingUserChoice).toBe(true);
        expect(questionEventReceived).toBe(true);
    });
});
