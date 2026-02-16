import winston from "winston";
import { MarkdownStructureAgent } from "./markdown_structure_agent.ts";

const logger = winston.child({ module: "MarkdownSanitizer" });

/**
 * 📝 Sanitizador de Markdown (High-Fidelity TypeScript Version).
 * Realiza a limpeza e normalização garantindo conformidade absoluta com MD041 e MD047.
 * 
 * Melhorias sobre a versão legacy:
 * 1. Performance otimizada usando manipulação de strings Bun.
 * 2. Proteção contra BOM (Byte Order Mark).
 * 3. Fallback inteligente para relatórios sem título.
 * 4. [PhD Update] Suporte a Markdown aninhado (Blockquotes) para MD022 e MD032.
 */
export class MarkdownSanitizer {
    /**
     * Sanitiza o conteúdo de um arquivo Markdown.
     * @param content Conteúdo bruto do markdown.
     */
    public async sanitize(content: string): Promise<string> {
        if (!content) return "";
        const startTime = Date.now();

        // 1. Limpeza de caracteres especiais (como BOM) e normalização de quebra de linha
        let internalContent = content.replace(/^\ufeff+/, '').replace(/\r\n/g, "\n").trim();
        let lines = internalContent.split("\n");

        // 2. Delegação para o Agente de Estrutura para refinamento semântico
        const structureAgent = new MarkdownStructureAgent(lines);
        lines = structureAgent.executeRefinement();

        // 3. Aplicação de políticas de conformidade
        lines = this.cleanup(lines);
        lines = this.ensureBlanksAroundHeadings(lines); // MD022
        lines = this.ensureBlanksAroundLists(lines);    // MD032
        lines = this.ensureH1(lines);

        // 4. Junção com garantia de newline no final (MD047)
        const sanitized = lines.join("\n").trim() + "\n";

        const duration = Date.now() - startTime;
        logger.info(`📝 Markdown Sanitized em ${duration}ms (Incluso refinamento estrutural)`);

        return sanitized;
    }

    private cleanup(lines: string[]): string[] {
        // Remove linhas vazias no início e no fim
        while (lines.length > 0 && lines[0]!.trim().length === 0) lines.shift();
        while (lines.length > 0 && lines[lines.length - 1]!.trim().length === 0) lines.pop();
        return lines;
    }

    private ensureH1(lines: string[]): string[] {
        // Se vazio, cria um cabeçalho padrão
        if (lines.length === 0) return ["# 🏛️ RELATÓRIO SISTÊMICO", ""];

        // Se a primeira linha já é H1, está correto
        if (lines[0]!.trim().startsWith("# ")) return lines;

        // Procura por um H1 em outras partes e o promove para o topo
        for (let i = 0; i < lines.length; i++) {
            if (lines[i]!.trim().startsWith("# ")) {
                const [h1] = lines.splice(i, 1);
                return [h1!, "", ...lines];
            }
        }

        // Se não encontrar nenhum H1, cria um
        return ["# 🏛️ RELATÓRIO SISTÊMICO", "", ...lines];
    }

    private ensureBlanksAroundHeadings(lines: string[]): string[] {
        const result: string[] = [];
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i]!;
            const clean = line.replace(/^>\s*/, "").trim();
            const prefix = line.match(/^>\s*/)?.[0] || "";
            const isHeading = clean.startsWith("#");

            if (isHeading) {
                // Ensure blank line before (unless first line)
                if (result.length > 0) {
                    const prev = result[result.length - 1]!;
                    const prevClean = prev.replace(/^>\s*/, "").trim();
                    if (prevClean !== "") {
                        result.push(prefix.trimEnd());
                    }
                }
                result.push(line);

                // Ensure blank line after
                if (i + 1 < lines.length) {
                    const next = lines[i + 1]!;
                    const nextClean = next.replace(/^>\s*/, "").trim();
                    if (nextClean !== "") {
                        result.push(prefix.trimEnd());
                    }
                }
            } else {
                result.push(line);
            }
        }
        return result;
    }

    private ensureBlanksAroundLists(lines: string[]): string[] {
        const result: string[] = [];
        const isList = (l: string) => /^\s*([-*]|\d+\.)\s+/.test(l.replace(/^>\s*/, ""));
        const isHorizontalRule = (l: string) => /^\s*-{3,}\s*$/.test(l.replace(/^>\s*/, ""));

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i]!;
            const prefix = line.match(/^>\s*/)?.[0] || "";
            const prev = i > 0 ? lines[i - 1]! : "";
            const clean = line.replace(/^>\s*/, "").trim();

            // MD032: Blank line BEFORE list
            const prevClean = prev.replace(/^>\s*/, "").trim();
            if (isList(line) && !isList(prev) && prevClean !== "") {
                if (result.length > 0 && result[result.length - 1]!.replace(/^>\s*/, "").trim() !== "") {
                    result.push(prefix.trimEnd());
                }
            }

            result.push(line);

            // MD032: Blank line AFTER list
            const next = i + 1 < lines.length ? lines[i + 1]! : "";
            const nextClean = next.replace(/^>\s*/, "").trim();

            if (isList(line) && !isList(next) && (nextClean !== "" || isHorizontalRule(next))) {
                if (nextClean !== "") {
                    result.push(prefix.trimEnd());
                }
            }
        }
        return result;
    }
}

// Extensão utilitária para strings similar ao Python lstrip
declare global {
    interface String {
        lstrip(chars?: string): string;
    }
}

if (!String.prototype.lstrip) {
    String.prototype.lstrip = function (chars?: string): string {
        if (!chars) return this.trimStart();
        let start = 0;
        while (start < this.length && chars.includes(this[start]!)) {
            start++;
        }
        return this.substring(start);
    };
}
