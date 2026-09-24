import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import * as fs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";
import { PsaContext } from "../src_local/psa/kernel/psa_context.ts";
import { PsaPluginLoader } from "../src_local/psa/kernel/psa_plugin_loader.ts";

/**
 * 🧪 Unit Tests: PsaPluginLoader
 *
 * Target Component: src_local/psa/kernel/psa_plugin_loader.ts
 * Strategy: Arrange-Act-Assert (AAA) pattern testing file loading, directory scanning,
 * file filtering, error resilience, and hot-reloading using isolated temporary workspace directories.
 */
describe("PsaPluginLoader Unit Tests", () => {
    let tmpDir: string;
    let ctx: PsaContext;
    let loader: PsaPluginLoader;

    beforeEach(() => {
        tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "psa-plugin-loader-test-"));
        ctx = new PsaContext(tmpDir);
        loader = new PsaPluginLoader(ctx);
    });

    afterEach(() => {
        if (fs.existsSync(tmpDir)) {
            fs.rmSync(tmpDir, { recursive: true, force: true });
        }
    });

    describe("loadFromFile", () => {
        it("should return null and warn when file does not exist", async () => {
            // Arrange
            const nonExistentPath = path.join(tmpDir, "non_existent_plugin.ts");

            // Act
            const result = await loader.loadFromFile(nonExistentPath);

            // Assert
            expect(result).toBeNull();
        });

        it("should return null when file exports no valid PsaPlugin implementation", async () => {
            // Arrange
            const filePath = path.join(tmpDir, "invalid_plugin.ts");
            const fileContent = `
                export class NotAPlugin {
                    hello() { return "world"; }
                }
                export const someValue = 42;
            `;
            fs.writeFileSync(filePath, fileContent);

            // Act
            const result = await loader.loadFromFile(filePath);

            // Assert
            expect(result).toBeNull();
        });

        it("should successfully load and register a valid PsaPlugin exported class", async () => {
            // Arrange
            const filePath = path.join(tmpDir, "valid_plugin.ts");
            const fileContent = `
                export class SampleTestPlugin {
                    name = "sample-test-plugin";
                    version = "1.0.0";
                    apply(ctx) {
                        ctx.registerService("sample_service", { active: true });
                    }
                }
            `;
            fs.writeFileSync(filePath, fileContent);

            // Act
            const plugin = await loader.loadFromFile(filePath);

            // Assert
            expect(plugin).not.toBeNull();
            expect(plugin?.name).toBe("sample-test-plugin");
            expect(ctx.plugins.has("sample-test-plugin")).toBeTrue();
            expect(ctx.hasService("sample_service")).toBeTrue();
        });

        it("should handle relative paths using workspaceRoot", async () => {
            // Arrange
            const relFileName = "rel_plugin.ts";
            const absFilePath = path.join(tmpDir, relFileName);
            const fileContent = `
                export class RelativePlugin {
                    name = "relative-plugin";
                    apply(ctx) {}
                }
            `;
            fs.writeFileSync(absFilePath, fileContent);

            // Act
            const plugin = await loader.loadFromFile(relFileName);

            // Assert
            expect(plugin).not.toBeNull();
            expect(plugin?.name).toBe("relative-plugin");
            expect(ctx.plugins.has("relative-plugin")).toBeTrue();
        });

        it("should ignore constructors that throw on instantiation and continue loop", async () => {
            // Arrange
            const filePath = path.join(tmpDir, "throwing_constructor.ts");
            const fileContent = `
                export class ThrowingClass {
                    constructor() {
                        throw new Error("Cannot instantiate me");
                    }
                }
                export class ValidSecondPlugin {
                    name = "valid-second-plugin";
                    apply(ctx) {}
                }
            `;
            fs.writeFileSync(filePath, fileContent);

            // Act
            const plugin = await loader.loadFromFile(filePath);

            // Assert
            expect(plugin).not.toBeNull();
            expect(plugin?.name).toBe("valid-second-plugin");
        });

        it("should return null gracefully if module import or execution fails", async () => {
            // Arrange
            const filePath = path.join(tmpDir, "syntax_error.ts");
            fs.writeFileSync(filePath, "export class SyntaxErr { name = 'err'; apply( { "); // Malformed code

            // Act
            const result = await loader.loadFromFile(filePath);

            // Assert
            expect(result).toBeNull();
        });
    });

    describe("loadFromDirectory", () => {
        it("should return empty array if directory does not exist", async () => {
            // Arrange
            const nonExistentDir = path.join(tmpDir, "missing_dir");

            // Act
            const loaded = await loader.loadFromDirectory(nonExistentDir);

            // Assert
            expect(loaded).toBeArray();
            expect(loaded.length).toBe(0);
        });

        it("should scan directory recursively and ignore .test.ts, .d.ts, and index.ts files", async () => {
            // Arrange
            const pluginsDir = path.join(tmpDir, "plugins");
            const subDir = path.join(pluginsDir, "nested");
            fs.mkdirSync(subDir, { recursive: true });

            // File 1: Valid plugin
            fs.writeFileSync(path.join(pluginsDir, "plugin_one.ts"), `
                export class PluginOne {
                    name = "plugin-one";
                    apply(ctx) {}
                }
            `);

            // File 2: Nested valid plugin
            fs.writeFileSync(path.join(subDir, "plugin_two.ts"), `
                export class PluginTwo {
                    name = "plugin-two";
                    apply(ctx) {}
                }
            `);

            // Ignored files:
            fs.writeFileSync(path.join(pluginsDir, "plugin_one.test.ts"), `
                export class IgnoredTestPlugin { name = "ignored-test"; apply(ctx) {} }
            `);
            fs.writeFileSync(path.join(pluginsDir, "types.d.ts"), `
                export interface Dummy {}
            `);
            fs.writeFileSync(path.join(pluginsDir, "index.ts"), `
                export class IgnoredIndexPlugin { name = "ignored-index"; apply(ctx) {} }
            `);

            // Act
            const loaded = await loader.loadFromDirectory(pluginsDir);

            // Assert
            expect(loaded.length).toBe(2);
            const names = loaded.map((p) => p.name);
            expect(names).toContain("plugin-one");
            expect(names).toContain("plugin-two");
            expect(names).not.toContain("ignored-test");
            expect(names).not.toContain("ignored-index");
        });

        it("should handle relative directory path using workspaceRoot", async () => {
            // Arrange
            const relDirName = "rel_plugins";
            const absDirDir = path.join(tmpDir, relDirName);
            fs.mkdirSync(absDirDir, { recursive: true });
            fs.writeFileSync(path.join(absDirDir, "rel_p.ts"), `
                export class RelDirPlugin {
                    name = "rel-dir-plugin";
                    apply(ctx) {}
                }
            `);

            // Act
            const loaded = await loader.loadFromDirectory(relDirName);

            // Assert
            expect(loaded.length).toBe(1);
            expect(loaded[0].name).toBe("rel-dir-plugin");
        });

        it("should handle error when directory reading fails", async () => {
            // Arrange - point readdir to a file instead of a directory
            const filePath = path.join(tmpDir, "not_a_dir.ts");
            fs.writeFileSync(filePath, "export const x = 1;");

            // Act
            const loaded = await loader.loadFromDirectory(filePath);

            // Assert
            expect(loaded).toBeArray();
            expect(loaded.length).toBe(0);
        });
    });

    describe("reloadPlugin", () => {
        it("should unregister existing plugin and reload new version on reloadPlugin", async () => {
            // Arrange
            const filePath = path.join(tmpDir, "reloadable_plugin.ts");
            fs.writeFileSync(filePath, `
                export class Version1Plugin {
                    name = "reload-plugin";
                    apply(ctx) {
                        ctx.registerService("v_service", { version: 1 });
                    }
                }
            `);

            const initialPlugin = await loader.loadFromFile(filePath);
            expect(initialPlugin).not.toBeNull();
            expect(ctx.plugins.has("reload-plugin")).toBeTrue();

            // Update file content
            fs.writeFileSync(filePath, `
                export class Version2Plugin {
                    name = "reload-plugin";
                    apply(ctx) {
                        ctx.registerService("v_service", { version: 2 });
                    }
                }
            `);

            // Act
            const success = await loader.reloadPlugin("reload-plugin", filePath);

            // Assert
            expect(success).toBeTrue();
            expect(ctx.plugins.has("reload-plugin")).toBeTrue();
        });
    });
});
