import { expect, test, describe } from "bun:test";
import { MarkdownRenderer } from "./markdown_renderer";

describe("Markdown Renderer Deep Audit", () => {
    test("should render basic markdown", async () => {
        const html = await MarkdownRenderer.toHTML("test");
        expect(html).toContain("test");
    });

    test("should report support status", () => {
        expect(MarkdownRenderer.isSupported).toBe(true);
    });
});
