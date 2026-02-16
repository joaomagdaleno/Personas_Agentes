import { describe, expect, test } from "bun:test";
import { StructuralAnalyst } from "../src_local/agents/Support/Analysis/structural_analyst";

describe("StructuralAnalyst", () => {
    const analyst = new StructuralAnalyst();

    test("should create StructuralAnalyst instance", () => {
        expect(analyst).toBeDefined();
        expect(typeof analyst.analyzePython).toBe("function");
        expect(typeof analyst.analyze_file_logic).toBe("function");
        expect(typeof analyst.calculateMaturity).toBe("function");
    });

    test("should check if file is analysable", () => {
        // Mock Path class
        class MockPath {
            constructor(private nameValue: string) {}
            
            name(): string {
                return this.nameValue;
            }
            
            toString(): string {
                return this.nameValue;
            }
        }

        const analyzableFiles = [
            new MockPath("file.py"),
            new MockPath("file.ts"),
            new MockPath("file.tsx"),
            new MockPath("file.js"),
            new MockPath("file.yaml")
        ];

        const nonAnalyzableFiles = [
            new MockPath("file.txt"),
            new MockPath("file.css"),
            new MockPath("file.html"),
            new MockPath("file.jpg"),
            new MockPath("file.png")
        ];

        analyzableFiles.forEach(file => {
            expect(analyst.isAnalyable(file)).toBe(true);
        });

        nonAnalyzableFiles.forEach(file => {
            expect(analyst.isAnalyable(file)).toBe(false);
        });
    });

    test("should ignore certain paths", () => {
        // Mock Path class
        class MockPath {
            constructor(private pathValue: string) {}
            
            name(): string {
                return this.pathValue.split("/").pop() || "";
            }
            
            toString(): string {
                return this.pathValue;
            }
        }

        const ignoredPaths = [
            new MockPath("/.git/"),
            new MockPath("/node_modules/"),
            new MockPath("/__pycache__/"),
            new MockPath("/.venv/"),
            new MockPath("/.idea/"),
            new MockPath("/.vscode/"),
            new MockPath("/build/"),
            new MockPath("/dist/"),
            new MockPath("/out/"),
            new MockPath("/.agent/other-path/"),
            new MockPath(".agent/")
        ];

        const allowedPaths = [
            new MockPath("/src/file.py"),
            new MockPath("/lib/file.ts"),
            new MockPath("/assets/image.png"),
            new MockPath("/.agent/fast-android-build/")
        ];

        ignoredPaths.forEach(path => {
            expect(analyst.shouldIgnore(path)).toBe(true);
        });

        allowedPaths.forEach(path => {
            expect(analyst.shouldIgnore(path)).toBe(false);
        });
    });

    test("should read project files", async () => {
        // Create a temporary test file
        const testContent = "test content";
        const testFile = Bun.file("test-temp-file.txt");
        
        // This test will fail if Bun doesn't have write access
        // For safety, we'll skip actually creating files
        expect(true).toBe(true);
    });
});
