import { describe, it, expect } from "bun:test";
import { MarkdownRenderer } from "../src_local/engines/reporting/ui_ux_architect_service.ts";

describe("Markdown Renderer Deep Audit", () => {
    it("should render basic markdown", async () => {
        const html = await MarkdownRenderer.toHTML("# Hello");
        expect(html).toContain("Hello");
    });

    it("should report support status", () => {
        expect(MarkdownRenderer.isSupported).toBe(true);
    });
});
