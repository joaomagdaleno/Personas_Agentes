import * as cp from "node:child_process";
import * as path from "node:path";
import * as fs from "node:fs";

/**
 * 🟦 CogHelpers - PhD in AI Connectivity (Rust Unified Brain)
 */
export class CogHelpers {
    private static BINARY_PATH = path.resolve(process.cwd(), "src_native/analyzer/target/release/analyzer.exe");

    static getParams(o: any, def: number) {
        return {
            temperature: o.temperature || 0.7,
            num_predict: o.max_tokens || def
        };
    }

    static async callRustBrain(prompt: string): Promise<string | null> {
        const tmpDir = path.join(process.cwd(), ".gemini", "tmp");
        if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

        const tmpFile = path.join(tmpDir, `prompt_${Date.now()}.txt`);
        fs.writeFileSync(tmpFile, prompt);

        try {
            if (!fs.existsSync(this.BINARY_PATH)) {
                return null;
            }

            const output = cp.execSync(`${this.BINARY_PATH} reason ${tmpFile}`, {
                encoding: "utf8",
                timeout: 60000, // 60s timeout for safety
            });

            return output.trim() || null;
        } catch (error) {
            console.error("❌ [CogHelpers] Rust Brain Execution Failed:", error);
            return null;
        } finally {
            if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile);
        }
    }

    // Legacy Support (No-op)
    static async unloadModel() { return true; }
}
