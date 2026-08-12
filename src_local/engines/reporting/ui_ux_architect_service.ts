import { writeFileSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import winston from "winston";

const logger = winston.child({ module: "UIUXArchitectService" });

export const PORTAL_METADATA = {
    title: "Governança Soberana PhD",
    author: "Personas Agentes",
    version: "9.0.0"
};

export function renderMarkdown(filepath: string): string {
    if (!existsSync(filepath)) return "<p>Markdown file not found.</p>";
    const text = readFileSync(filepath, "utf-8");
    return `<div class="md-body">${text}</div>`;
}

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

export const GEN_MODE = "PROFESSIONAL";
export const GENERATOR_CONFIG = {
    mode: "PROFESSIONAL",
    target: "SOVEREIGN",
    version: "8.0"
};
export const PORTAL_METADATA_REF = PORTAL_METADATA;

export function generatePortal() {
    try {
        const mdPath = join(process.cwd(), "docs", "auto_healing_VERIFIED.md");
        const htmlPath = join(process.cwd(), "docs", "governance_portal.html");
        const content = `<h1>${PORTAL_METADATA.title}</h1>${renderMarkdown(mdPath)}`;
        writeFileSync(htmlPath, content);
    } catch {
        // Fallback para evitar falhas durante import de módulos em ambientes sem pasta docs
    }
}

export class MarkdownUtil {
    static deduplicateHeader(h: string, seen: Record<string, number>): string {
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

    static applyHeaderPadding(res: string[], raw: string[], idx: number): void {
        const nextLine = raw[idx + 1];
        if (nextLine !== undefined && nextLine.trim() !== "") {
            res.push("");
        }
    }
}

export class MarkdownStructureProcessor {
    private raw: string[];
    private res: string[] = [];
    private state = { seen: {} as Record<string, number>, inCb: false };

    constructor(rawLines: string[]) {
        this.raw = rawLines;
    }

    process(): string[] {
        logger.debug(`📝 [MarkdownProcessor] Iniciando processamento de ${this.raw.length} linhas.`);

        for (let i = 0; i < this.raw.length; i++) {
            const line = this.raw[i];
            if (line === undefined) continue;
            const stripped = line.trimEnd();

            if (this.handleBlock(stripped, line)) continue;

            if (stripped.trim().startsWith('#')) {
                this.handleHeader(stripped.trim(), i);
            } else if (this.shouldAppend(stripped)) {
                this.res.push(stripped);
            }
        }

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
        if (this.res.length > 0 && this.res[this.res.length - 1] !== "") {
            this.res.push("");
        }

        const h = MarkdownUtil.deduplicateHeader(line, this.state.seen);
        this.res.push(h);

        MarkdownUtil.applyHeaderPadding(this.res, this.raw, idx);
    }

    private shouldAppend(stripped: string): boolean {
        return stripped.trim() !== "" || (this.res.length > 0 && this.res[this.res.length - 1] !== "");
    }
}

/**
 * 🎨 UIUXArchitectService
 * Serviço Soberano da Super Persona ui_ux_architect.
 * Unifica renderização de Markdown, processamento visual e geração de portais HTML.
 */
export class UIUXArchitectService {
    renderMarkdownToHTML(markdown: string): string {
        return `<div>${markdown}</div>`;
    }

    generatePortalReport() {
        generatePortal();
    }
}

export const DATE_FORMAT = "YYYY-MM-DD HH:mm:ss.SSS";

export function formatDate(date: Date = new Date()): string {
    return getPhdTimestamp(date);
}

export function getPhdTimestamp(date: Date = new Date()): string {
    return date.toISOString().replace('T', ' ').replace('Z', '');
}
