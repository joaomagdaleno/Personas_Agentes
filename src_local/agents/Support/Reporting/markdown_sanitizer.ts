import winston from "winston";
import { MarkdownStructureAgent } from "./markdown_structure_agent.ts";
import { StyleRules } from "./strategies/StyleRules.ts";

const logger = winston.child({ module: "MarkdownSanitizer" });

/**
 * 📝 Sanitizador de Markdown (High-Fidelity TypeScript Version).
 * Refatorado para usar Estratégias de Estilo (StyleRules).
 */
export class MarkdownSanitizer {
    public async sanitize(content: string): Promise<string> {
        if (!content) return "";
        const startTime = Date.now();

        let internalContent = content.replace(/^\ufeff+/, '').replace(/\r\n/g, "\n").trim();
        let lines = internalContent.split("\n");

        const structureAgent = new MarkdownStructureAgent(lines);
        lines = structureAgent.executeRefinement();

        // Aplicação de políticas via StyleRules
        lines = this.cleanup(lines);
        lines = StyleRules.ensureBlanksAroundHeadings(lines);
        lines = StyleRules.ensureBlanksAroundLists(lines);
        lines = StyleRules.ensureBlanksAroundTables(lines);
        lines = StyleRules.ensureBlockquoteContinuity(lines);
        lines = this.ensureH1(lines);

        const sanitized = lines.join("\n").trim() + "\n";
        logger.info(`📝 Markdown Sanitized em ${Date.now() - startTime}ms`);

        return sanitized;
    }

    private cleanup(lines: string[]): string[] {
        while (lines.length > 0 && lines[0]!.trim().length === 0) lines.shift();
        while (lines.length > 0 && lines[lines.length - 1]!.trim().length === 0) lines.pop();
        return lines;
    }

    private ensureH1(lines: string[]): string[] {
        if (lines.length === 0) return ["# 🏛️ RELATÓRIO SISTÊMICO", ""];
        if (lines[0]!.trim().startsWith("# ")) return lines;

        for (let i = 0; i < lines.length; i++) {
            if (lines[i]!.trim().startsWith("# ")) {
                const [h1] = lines.splice(i, 1);
                return [h1!, "", ...lines];
            }
        }
        return ["# 🏛️ RELATÓRIO SISTÊMICO", "", ...lines];
    }
}
