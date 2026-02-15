import { MarkdownUtil } from "./markdown_util.ts";
import winston from "winston";

const logger = winston.child({ module: "MarkdownProcessor" });

/**
 * 📝 Processador Estrutural de Markdown.
 * Decompõe documentos em nós lógicos (headers, code blocks, content) para normalização PhD.
 */
export class MarkdownStructureProcessor {
    private raw: string[];
    private res: string[] = [];
    private state = { seen: {} as Record<string, number>, inCb: false };

    constructor(rawLines: string[]) {
        this.raw = rawLines;
    }

    /**
     * Processa a estrutura do documento.
     */
    process(): string[] {
        logger.debug(`📝 [MarkdownProcessor] Iniciando processamento de ${this.raw.length} linhas.`);

        for (let i = 0; i < this.raw.length; i++) {
            const line = this.raw[i];
            if (line === undefined) continue;
            const stripped = line.trimEnd();

            // Gerenciamento de blocos de código
            if (this.handleBlock(stripped, line)) continue;

            // Processamento de Cabeçalhos
            if (stripped.trim().startsWith('#')) {
                this.handleHeader(stripped.trim(), i);
            } else if (this.shouldAppend(stripped)) {
                // Conteúdo regular ou espaçamento horizontal
                this.res.push(stripped);
            }
        }

        // MD041: Garante que não comece com linhas vazias (será tratado no sanitizer se necessário)
        return this.res;
    }

    private handleBlock(stripped: string, original: string): boolean {
        if (stripped.trim().startsWith('```')) {
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

    private handleHeader(line: string, idx: number): void {
        // MD022: Espaçamento acima
        if (this.res.length > 0 && this.res[this.res.length - 1] !== "") {
            this.res.push("");
        }

        const h = MarkdownUtil.deduplicateHeader(line, this.state.seen);
        this.res.push(h);

        // MD022: Espaçamento abaixo
        MarkdownUtil.applyHeaderPadding(this.res, this.raw, idx);
    }

    private shouldAppend(stripped: string): boolean {
        // Evita linhas em branco consecutivas (MD012)
        return stripped.trim() !== "" || (this.res.length > 0 && this.res[this.res.length - 1] !== "");
    }
}
