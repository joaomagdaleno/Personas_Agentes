import { describe, it, expect, beforeAll, afterAll } from "bun:test";
import { DebugEngine } from "./debug_engine.ts";
import * as fs from "node:fs";
import * as path from "node:path";

describe("DebugEngine Logic", () => {
    // We use a directory name that definitely shouldn't be in the safe-list
    const mockUserDir = "tmp_unsafe_diagnostics_test";
    const tempTestFile = path.resolve(mockUserDir, "unsafe_logic_script.ts");
    const cleanFile = path.resolve(mockUserDir, "clean_test_script.ts");

    beforeAll(() => {
        if (!fs.existsSync(mockUserDir)) fs.mkdirSync(mockUserDir);
        const content = `
            function test() {
                try {
                    // some logic
                } catch (e) {
                    // SILENT ERROR: empty catch
                }
            }
        `;
        fs.writeFileSync(tempTestFile, content);
    });

    afterAll(() => {
        if (fs.existsSync(tempTestFile)) fs.unlinkSync(tempTestFile);
        if (fs.existsSync(cleanFile)) fs.unlinkSync(cleanFile);
        if (fs.existsSync(mockUserDir)) fs.rmdirSync(mockUserDir);
    });

    it("should detect logic issues in a file", () => {
        console.log(`Auditing file: ${tempTestFile}`);
        const issues = DebugEngine.trace_file(tempTestFile);
        expect(Array.isArray(issues)).toBe(true);
        // If this still fails, we might need to check if ASTIntelligence.isNodeSafe is too permissive
        expect(issues.length).toBeGreaterThan(0);
        if (issues.length > 0) {
            expect(issues[0]).toHaveProperty("issue");
            expect(issues[0].issue).toMatch(/Captura de erro silenciosa/i);
        }
    });

    it("should return empty array for non-existent file gracefully", () => {
        const issues = DebugEngine.trace_file("non_existent_file.ts");
        expect(issues).toEqual([]);
    });

    it("should handle valid files with no issues", () => {
        fs.writeFileSync(cleanFile, "export const x = 1;");
        const issues = DebugEngine.trace_file(cleanFile);
        expect(issues).toEqual([]);
    });
});
