
/**
 * ⚡ Native Bun Markdown Renderer (v1.3.9)
 * Utiliza a API nativa de alta performance para parsing de Markdown.
 */
export class MarkdownRenderer {
    /**
     * Renderiza Markdown para HTML usando a engine nativa do Bun.
     * @param markdown Texto em markdown
     * @returns HTML string
     */
    static async toHTML(markdown: string): Promise<string> {
        const bunAny = Bun as any;
        if (bunAny.markdown && bunAny.markdown.toHTML) {
            return await bunAny.markdown.toHTML(markdown);
        }
        throw new Error("Bun.markdown API not available");
    }

    /**
     * Verifica se o ambiente suporta renderização nativa.
     */
    static get isSupported(): boolean {
        return !!Bun.markdown;
    }
}
