import { MarkdownUtil } from "../../utils/markdown_util.ts";

/**
 * Agente especialista em decomposição e normalização de estruturas Markdown.
 */
export class MarkdownStructureAgent {
    private raw: string[];
    private res: string[] = [];
    private state = { seen: {} as Record<string, number>, inCb: false };

    constructor(rawLines: string[]) {
        this.raw = rawLines;
    }

    /**
     * Executa a limpeza estrutural pesada (Refinement).
     */
    executeRefinement(): string[] {
        for (let i = 0; i < this.raw.length; i++) {
            const line = this.raw[i];
            if (line === undefined) continue;
            if (this.processLine(line, i)) {
                continue;
            }
        }
        return this.res;
    }

    private processLine(line: string, idx: number): boolean {
        const stripped = line.trimEnd();

        // Gerenciamento de blocos de código
        if (this.handleCodeBlock(stripped, line)) {
            return true;
        }

        // Processamento de Cabeçalhos
        if (stripped.trim().startsWith("#")) {
            this.applyHeaderLogic(stripped.trim(), idx);
            return true;
        }

        // Conteúdo regular
        if (stripped.trim() !== "" || (this.res.length > 0 && this.res[this.res.length - 1] !== "")) {
            this.res.push(stripped);
        }
        return false;
    }

    private handleCodeBlock(stripped: string, original: string): boolean {
        if (stripped.trim().startsWith("```")) {
            this.state.inCb = !this.state.inCb;
            this.res.push(original);
            return true;
        }
        if (this.state.inCb) {
            this.res.push(original);
            return true;
        }
        return false;
    }

    private applyHeaderLogic(line: string, idx: number): void {
        if (this.res.length > 0 && this.res[this.res.length - 1] !== "") {
            this.res.push("");
        }

        const h = MarkdownUtil.deduplicateHeader(line, this.state.seen);
        this.res.push(h);
        MarkdownUtil.applyHeaderPadding(this.res, this.raw, idx);
    }
}
