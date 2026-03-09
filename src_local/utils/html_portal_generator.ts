import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { renderMarkdown, PORTAL_METADATA } from "./portal_engine";

export const GEN_MODE = "PROFESSIONAL";
export const PORTAL_METADATA_REF = PORTAL_METADATA;

export function generatePortal() {
    const mdPath = join(process.cwd(), "docs", "auto_healing_VERIFIED.md");
    const htmlPath = join(process.cwd(), "docs", "governance_portal.html");
    const content = `<h1>${PORTAL_METADATA.title}</h1>${renderMarkdown(mdPath)}`;
    writeFileSync(htmlPath, content);
}

// Auto-execute logic moved from shadow to maintain parity
generatePortal();
