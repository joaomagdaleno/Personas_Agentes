import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import * as fs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";
import * as crypto from "node:crypto";
import {
    SLM_MODELS,
    findModel,
    resolveModelsDir,
    calculateFileSha256,
    downloadSingleModel,
    type SlmModelInfo
} from "../scripts/download_model.ts";

/**
 * Component Under Test: scripts/download_model.ts
 * Layer: Scripts / SLM Management & Model Weight Verification
 * Pattern: Arrange-Act-Assert (AAA)
 */
describe("download_model.ts - SLM Model Downloader & Verification Tests", () => {
    let tempDir: string;

    beforeEach(() => {
        tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "psa-model-test-"));
    });

    afterEach(() => {
        if (fs.existsSync(tempDir)) {
            fs.rmSync(tempDir, { recursive: true, force: true });
        }
    });

    describe("findModel", () => {
        it("should find model by exact ID", () => {
            // Arrange
            const targetId = "qwen2.5-coder-1.5b";

            // Act
            const model = findModel(targetId);

            // Assert
            expect(model).toBeDefined();
            expect(model?.id).toBe(targetId);
        });

        it("should find model by registered alias", () => {
            // Arrange
            const alias = "thinking";

            // Act
            const model = findModel(alias);

            // Assert
            expect(model).toBeDefined();
            expect(model?.id).toBe("qwen3-8b-thinking");
        });

        it("should return undefined for unknown model ID or alias", () => {
            // Arrange
            const unknown = "unknown-model-123";

            // Act
            const model = findModel(unknown);

            // Assert
            expect(model).toBeUndefined();
        });
    });

    describe("resolveModelsDir", () => {
        it("should return custom directory resolved path when customDir parameter is passed", () => {
            // Arrange
            const custom = "./relative/models/path";

            // Act
            const resolved = resolveModelsDir(custom);

            // Assert
            expect(resolved).toBe(path.resolve(custom));
        });

        it("should respect PSA_MODELS_DIR environment variable if customDir is omitted", () => {
            // Arrange
            const originalEnv = process.env.PSA_MODELS_DIR;
            const testEnvDir = path.join(tempDir, "env-models");
            process.env.PSA_MODELS_DIR = testEnvDir;

            try {
                // Act
                const resolved = resolveModelsDir();

                // Assert
                expect(resolved).toBe(path.resolve(testEnvDir));
            } finally {
                if (originalEnv !== undefined) {
                    process.env.PSA_MODELS_DIR = originalEnv;
                } else {
                    delete process.env.PSA_MODELS_DIR;
                }
            }
        });
    });

    describe("calculateFileSha256", () => {
        it("should calculate exact SHA-256 digest of a local file", async () => {
            // Arrange
            const content = "Personas Agentes Sovereign Architecture";
            const filePath = path.join(tempDir, "sample.txt");
            fs.writeFileSync(filePath, content, "utf-8");

            const expectedHash = crypto
                .createHash("sha256")
                .update(content)
                .digest("hex")
                .toLowerCase();

            // Act
            const calculatedHash = await calculateFileSha256(filePath);

            // Assert
            expect(calculatedHash).toBe(expectedHash);
        });
    });

    describe("downloadSingleModel", () => {
        it("should validate and accept an already downloaded valid local file without re-downloading", async () => {
            // Arrange
            const content = "valid gguf content simulation";
            const fileHash = crypto.createHash("sha256").update(content).digest("hex").toLowerCase();

            const testModel: SlmModelInfo = {
                id: "test-model",
                aliases: ["test"],
                name: "Test Model",
                filename: "test-model.gguf",
                url: "https://example.com/test-model.gguf",
                sha256: fileHash,
                sizeMb: 1,
                description: "Mock model for testing"
            };

            const targetFilePath = path.join(tempDir, testModel.filename);
            fs.writeFileSync(targetFilePath, content, "utf-8");

            // Act
            const success = await downloadSingleModel(testModel, tempDir, false);

            // Assert
            expect(success).toBe(true);
            expect(fs.existsSync(targetFilePath)).toBe(true);
            expect(fs.readFileSync(targetFilePath, "utf-8")).toBe(content);
        });

        it("should detect corrupted local file with mismatched SHA-256 and remove it before download", async () => {
            // Arrange
            const corruptedContent = "corrupted file contents";
            const validContent = "valid file contents after fix";
            const validHash = crypto.createHash("sha256").update(validContent).digest("hex").toLowerCase();

            const testModel: SlmModelInfo = {
                id: "corrupt-test-model",
                aliases: [],
                name: "Corrupt Test Model",
                filename: "corrupt-model.gguf",
                url: "https://example.com/corrupt-model.gguf",
                sha256: validHash,
                sizeMb: 1,
                description: "Corrupted model verification test"
            };

            const targetFilePath = path.join(tempDir, testModel.filename);
            fs.writeFileSync(targetFilePath, corruptedContent, "utf-8");

            // Act - Run with dryRun = true after corrupted file removal
            const success = await downloadSingleModel(testModel, tempDir, true);

            // Assert
            expect(success).toBe(true);
            expect(fs.existsSync(targetFilePath)).toBe(false); // Corrupted file should have been deleted
        });

        it("should return true in dry-run mode when target file does not exist", async () => {
            // Arrange
            const testModel: SlmModelInfo = { ...SLM_MODELS[0] };

            // Act
            const success = await downloadSingleModel(testModel, tempDir, true);

            // Assert
            expect(success).toBe(true);
        });
    });
});
