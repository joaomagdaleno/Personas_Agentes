import { readFileSync } from "node:fs";

export const PORTAL_METADATA = {
    title: "🏛️ PhD Governance Sentinel",
    version: "1.4.0-SOVEREIGN",
    engine: "BUN SIMD ACCEL"
};

export function getBaseStyles() {
    return `
        :root {
            --sidebar-width: 280px;
            --bg-deep: #06090f;
            --accent: #58a6ff;
            --success: #3fb950;
            --text-primary: #c9d1d9;
        }
        body { background: var(--bg-deep); color: var(--text-primary); font-family: sans-serif; }
    `;
}

export function renderMarkdown(path: string): string {
    const content = readFileSync(path, "utf-8");
    // @ts-ignore
    return Bun.markdown.html(content);
}
