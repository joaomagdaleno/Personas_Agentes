/**
 * 📝 Utilitários de Markdown PhD.
 * Provê funções atômicas para deduplicação e normalização de documentos.
 */
export class MarkdownUtil {
    /**
     * Evita headers duplicados adicionando sufixos de versão.
     */
    static deduplicateHeader(h: string, seen: Record<string, number>): string {
        // MD026: Pontuação proibida no final
        const hClean = h.replace(/[.!?: \t\n\r]+$/, "");

        const count = seen[hClean];
        if (count !== undefined) {
            const nextCount = count + 1;
            seen[hClean] = nextCount;
            return `${hClean} [v${nextCount}]`;
        }
        seen[hClean] = 1;
        return hClean;
    }

    /**
     * Garante espaçamento vertical após cabeçalhos (MD022).
     */
    static applyHeaderPadding(res: string[], raw: string[], idx: number): void {
        const nextLine = raw[idx + 1];
        if (nextLine !== undefined && nextLine.trim() !== "") {
            res.push("");
        }
    }
}
