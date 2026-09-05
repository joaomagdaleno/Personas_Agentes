import * as fs from "node:fs";
import * as path from "node:path";
import type { DshPlugin } from "../../kernel/dsh_plugin.ts";
import type { DshContext } from "../../kernel/dsh_context.ts";

export class FSPlugin implements DshPlugin {
    public name = "dsh-plugin-fs";
    public version = "1.0.0";
    public description = "Ferramentas soberanas de gerenciamento e edição atômica de arquivos e diretórios no workspace.";

    public apply(ctx: DshContext): void {
        const resolveSafePath = (targetPath: string): string => {
            const root = path.resolve(ctx.workspaceRoot);
            const resolved = path.isAbsolute(targetPath) ? path.resolve(targetPath) : path.resolve(root, targetPath);
            if (!resolved.startsWith(root)) {
                throw new Error(`[DSH FS Security] Acesso negado: o caminho '${targetPath}' viola os limites do workspace (${root}).`);
            }
            return resolved;
        };

        // 1. fs.read_file
        ctx.tools.register({
            name: "fs.read_file",
            description: "Lê o conteúdo de um arquivo do workspace com suporte a paginação de linhas.",
            schema: {
                type: "object",
                properties: {
                    filePath: { type: "string", description: "Caminho do arquivo (relativo ou absoluto)" },
                    startLine: { type: "number", description: "Linha inicial (1-indexada, opcional)" },
                    endLine: { type: "number", description: "Linha final (1-indexada, opcional)" }
                },
                required: ["filePath"]
            },
            isExclusive: false,
            execute: async (args: { filePath: string; startLine?: number; endLine?: number }) => {
                const safePath = resolveSafePath(args.filePath);
                if (!fs.existsSync(safePath)) {
                    throw new Error(`Arquivo não encontrado: ${args.filePath}`);
                }
                const content = fs.readFileSync(safePath, "utf-8");
                const lines = content.split(/\r?\n/);
                const totalLines = lines.length;

                const start = Math.max(1, args.startLine || 1);
                const end = Math.min(totalLines, args.endLine || totalLines);

                const slice = lines.slice(start - 1, end).join("\n");
                return {
                    filePath: path.relative(ctx.workspaceRoot, safePath),
                    totalLines,
                    startLine: start,
                    endLine: end,
                    content: slice
                };
            }
        });

        // 2. fs.write_file
        ctx.tools.register({
            name: "fs.write_file",
            description: "Cria ou substitui completamente um arquivo no workspace.",
            schema: {
                type: "object",
                properties: {
                    filePath: { type: "string", description: "Caminho do arquivo" },
                    content: { type: "string", description: "Conteúdo a ser gravado" },
                    overwrite: { type: "boolean", description: "Se deve sobrescrever se já existir" }
                },
                required: ["filePath", "content"]
            },
            isExclusive: true,
            execute: async (args: { filePath: string; content: string; overwrite?: boolean }) => {
                const safePath = resolveSafePath(args.filePath);
                if (fs.existsSync(safePath) && !args.overwrite) {
                    throw new Error(`Arquivo já existe e overwrite não foi especificado como true: ${args.filePath}`);
                }
                const parentDir = path.dirname(safePath);
                if (!fs.existsSync(parentDir)) {
                    fs.mkdirSync(parentDir, { recursive: true });
                }
                fs.writeFileSync(safePath, args.content, "utf-8");
                return {
                    filePath: path.relative(ctx.workspaceRoot, safePath),
                    bytesWritten: Buffer.byteLength(args.content, "utf-8"),
                    status: "created_or_updated"
                };
            }
        });

        // 3. fs.edit_file
        ctx.tools.register({
            name: "fs.edit_file",
            description: "Substitui um bloco contíguo de texto dentro de um arquivo existente com precisão atômica.",
            schema: {
                type: "object",
                properties: {
                    filePath: { type: "string", description: "Caminho do arquivo existente" },
                    targetContent: { type: "string", description: "Texto exato a ser localizado e substituído" },
                    replacementContent: { type: "string", description: "Novo texto para substituir o trecho original" }
                },
                required: ["filePath", "targetContent", "replacementContent"]
            },
            isExclusive: true,
            execute: async (args: { filePath: string; targetContent: string; replacementContent: string }) => {
                const safePath = resolveSafePath(args.filePath);
                if (!fs.existsSync(safePath)) {
                    throw new Error(`Arquivo não encontrado para edição: ${args.filePath}`);
                }
                const original = fs.readFileSync(safePath, "utf-8");
                if (!original.includes(args.targetContent)) {
                    throw new Error(`O trecho alvo especificado em targetContent não foi encontrado no arquivo.`);
                }
                const occurrences = original.split(args.targetContent).length - 1;
                if (occurrences > 1) {
                    throw new Error(`O trecho alvo é ambíguo (${occurrences} ocorrências encontradas). Forneça mais contexto de linhas.`);
                }
                const updated = original.replace(args.targetContent, args.replacementContent);
                fs.writeFileSync(safePath, updated, "utf-8");
                return {
                    filePath: path.relative(ctx.workspaceRoot, safePath),
                    status: "edited",
                    bytes: Buffer.byteLength(updated, "utf-8")
                };
            }
        });

        // 4. fs.list_dir
        ctx.tools.register({
            name: "fs.list_dir",
            description: "Lista o conteúdo de um diretório dentro do workspace de forma estruturada.",
            schema: {
                type: "object",
                properties: {
                    dirPath: { type: "string", description: "Caminho do diretório (vazio ou '.' para raiz)" }
                }
            },
            isExclusive: false,
            execute: async (args: { dirPath?: string }) => {
                const target = args.dirPath ? resolveSafePath(args.dirPath) : ctx.workspaceRoot;
                if (!fs.existsSync(target) || !fs.statSync(target).isDirectory()) {
                    throw new Error(`Diretório inválido ou não encontrado: ${args.dirPath || "."}`);
                }
                const entries = fs.readdirSync(target, { withFileTypes: true });
                const items = entries.map(e => ({
                    name: e.name,
                    isDirectory: e.isDirectory(),
                    relativePath: path.relative(ctx.workspaceRoot, path.join(target, e.name))
                }));
                return {
                    directory: path.relative(ctx.workspaceRoot, target) || ".",
                    count: items.length,
                    items
                };
            }
        });
    }
}
