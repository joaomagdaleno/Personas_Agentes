export class MarkdownRenderer {
    static async toHTML(markdown: string): Promise<string> {
        return `<div>${markdown}</div>`;
    }

    static get isSupported(): boolean {
        return true;
    }
}

export const RENDER_ENGINE = "V8CORE";
export const VERSION = "4.2.0";
