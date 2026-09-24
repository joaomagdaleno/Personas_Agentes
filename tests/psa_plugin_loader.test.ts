import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import { PsaContext } from "../src_local/psa/kernel/psa_context.ts";
import { PsaPluginLoader } from "../src_local/psa/kernel/psa_plugin_loader.ts";
import * as fs from "node:fs";
import * as path from "node:path";

/**
 * 🧪 Test Strategy
 * Layer: src_local/psa/kernel/psa_plugin_loader.ts (PsaPluginLoader)
 * Pattern: Arrange-Act-Assert (AAA) / Given-When-Then
 * Objective: Verify dynamic file dynamic loading, directory scanning, file exclusion rules,
 * invalid plugin class handling, constructor exception handling, and hot-reloading.
 */

describe("PsaPluginLoader Unit Tests", () => {
    let scratchDir: string;
    let ctx: PsaContext;
    let loader: PsaPluginLoader;

    beforeEach(() => {
        PsaContext.resetInstance();
        scratchDir = path.resolve(process.cwd(), `.psa_loader_test_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`);
        fs.mkdirSync(scratchDir, { recursive: true });
        ctx = PsaContext.getInstance(scratchDir);
        loader = new PsaPluginLoader(ctx);
    });

    afterEach(() => {
        PsaContext.resetInstance();
        try {
            if (fs.existsSync(scratchDir)) {
                fs.rmSync(scratchDir, { recursive: true, force: true });
            }
        } catch {}
    });

    describe("loadFromFile", () => {
        it("should return null when loading a non-existent file", async () => {
            // Arrange
            const missingPath = path.join(scratchDir, "non_existent_plugin.ts");

            // Act
            const plugin = await loader.loadFromFile(missingPath);

            // Assert
            expect(plugin).toBeNull();
        });

        it("should return null and handle gracefully if target file is not a valid PsaPlugin", async () => {
            // Arrange
            const filePath = path.join(scratchDir, "invalid_plugin.ts");
            const code = `
                export class InvalidClass {
                    someMethod() { return true; }
                }
            `;
            fs.writeFileSync(filePath, code, "utf-8");

            // Act
            const plugin = await loader.loadFromFile(filePath);

            // Assert
            expect(plugin).toBeNull();
        });

        it("should handle constructor errors in exported classes gracefully and return null", async () => {
            // Arrange
            const filePath = path.join(scratchDir, "throwing_plugin.ts");
            const code = `
                export class ThrowingPlugin {
                    constructor() {
                        throw new Error("Constructor initialization error!");
                    }
                }
            `;
            fs.writeFileSync(filePath, code, "utf-8");

            // Act
            const plugin = await loader.loadFromFile(filePath);

            // Assert
            expect(plugin).toBeNull();
        });

        it("should resolve relative paths against workspaceRoot and load valid plugin", async () => {
            // Arrange
            const relativePath = "relative_plugin.ts";
            const absolutePath = path.join(scratchDir, relativePath);
            const code = `
                export class RelativePlugin {
                    name = "relative-plugin";
                    version = "1.0.0";
                    apply(c) {
                        c.tools.register({
                            name: "relative.tool",
                            description: "Relative tool",
                            schema: { type: "object", properties: {} },
                            execute: async () => ({ ok: true })
                        });
                    }
                }
            `;
            fs.writeFileSync(absolutePath, code, "utf-8");

            // Act
            const plugin = await loader.loadFromFile(relativePath);

            // Assert
            expect(plugin).not.toBeNull();
            expect(plugin?.name).toBe("relative-plugin");
            expect(ctx.plugins.has("relative-plugin")).toBe(true);
            expect(ctx.tools.has("relative.tool")).toBe(true);
        });
    });

    describe("loadFromDirectory", () => {
        it("should return empty array if directory does not exist", async () => {
            // Arrange
            const missingDir = path.join(scratchDir, "missing_dir");

            // Act
            const plugins = await loader.loadFromDirectory(missingDir);

            // Assert
            expect(plugins).toEqual([]);
        });

        it("should recursively load valid plugins and skip ignored files (.test.ts, .d.ts, index.ts)", async () => {
            // Arrange
            const subDir = path.join(scratchDir, "sub_plugins");
            fs.mkdirSync(subDir, { recursive: true });

            // 1. Valid plugin file
            const validPluginFile = path.join(scratchDir, "valid_p1.ts");
            fs.writeFileSync(validPluginFile, `
                export class ValidPlugin1 {
                    name = "valid-p1";
                    version = "1.0.0";
                    apply(c) {}
                }
            `, "utf-8");

            // 2. Valid nested plugin file
            const nestedPluginFile = path.join(subDir, "valid_p2.ts");
            fs.writeFileSync(nestedPluginFile, `
                export class ValidPlugin2 {
                    name = "valid-p2";
                    version = "1.0.0";
                    apply(c) {}
                }
            `, "utf-8");

            // 3. Ignored files
            fs.writeFileSync(path.join(scratchDir, "ignored.test.ts"), `export class TestFile {}`, "utf-8");
            fs.writeFileSync(path.join(scratchDir, "ignored.d.ts"), `export type Foo = string;`, "utf-8");
            fs.writeFileSync(path.join(scratchDir, "index.ts"), `export class IndexFile {}`, "utf-8");

            // Act
            const loadedPlugins = await loader.loadFromDirectory(scratchDir);

            // Assert
            expect(loadedPlugins.length).toBe(2);
            const names = loadedPlugins.map(p => p.name);
            expect(names).toContain("valid-p1");
            expect(names).toContain("valid-p2");
        });

        it("should handle readdir errors gracefully", async () => {
            // Arrange: pass a file path instead of directory path to cause fs error in readdir
            const filePath = path.join(scratchDir, "file_as_dir.ts");
            fs.writeFileSync(filePath, "console.log('not a dir');", "utf-8");

            // Act
            const plugins = await loader.loadFromDirectory(filePath);

            // Assert
            expect(plugins).toEqual([]);
        });
    });

    describe("reloadPlugin", () => {
        it("should unregister existing plugin and load plugin from specified file on reloadPlugin", async () => {
            // Arrange
            const initialPluginFile = path.join(scratchDir, "initial_plugin.ts");
            const newPluginFile = path.join(scratchDir, "new_plugin.ts");

            fs.writeFileSync(initialPluginFile, `
                export class InitialPlugin {
                    name = "target-plugin";
                    version = "1.0.0";
                    apply(c) {
                        c.tools.register({
                            name: "target.v1",
                            description: "V1 tool",
                            schema: { type: "object", properties: {} },
                            execute: async () => ({ version: "v1" })
                        });
                    }
                }
            `, "utf-8");

            fs.writeFileSync(newPluginFile, `
                export class NewPlugin {
                    name = "target-plugin";
                    version = "2.0.0";
                    apply(c) {
                        c.tools.register({
                            name: "target.v2",
                            description: "V2 tool",
                            schema: { type: "object", properties: {} },
                            execute: async () => ({ version: "v2" })
                        });
                    }
                }
            `, "utf-8");

            // Load initial version
            await loader.loadFromFile(initialPluginFile);
            expect(ctx.plugins.has("target-plugin")).toBe(true);
            expect(ctx.tools.has("target.v1")).toBe(true);

            // Act: reload target-plugin with new file
            const success = await loader.reloadPlugin("target-plugin", newPluginFile);

            // Assert
            expect(success).toBe(true);
            expect(ctx.plugins.has("target-plugin")).toBe(true);
            expect(ctx.tools.has("target.v1")).toBe(false); // V1 tool removed when old plugin was unregistered
            expect(ctx.tools.has("target.v2")).toBe(true); // V2 tool registered
        });
    });
});
