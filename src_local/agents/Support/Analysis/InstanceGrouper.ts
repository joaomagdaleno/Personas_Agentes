import * as fs from "node:fs";
import * as path from "node:path";
import { extractPythonFingerprint, extractTSFingerprint, capitalize } from "./parity_utils";
import { FingerprintExtractor } from "./strategies/FingerprintExtractor";

/**
 * 📂 InstanceGrouper — Helper for grouping agent instances across stacks.
 */
export class InstanceGrouper {
    static async group(tsRoot: string): Promise<Map<string, any[]>> {
        const groups = new Map<string, any[]>();
        const stacks = ["Bun", "Flutter", "Go", "Kotlin", "Python", "Rust", "TypeScript"];
        const cats = ["Audit", "Content", "Strategic", "System"];

        // Try batch extraction first (Rust-powered via gRPC)
        try {
            const extractor = new FingerprintExtractor();
            const batchResults = await extractor.batchExtract(tsRoot);

            if (batchResults.size > 0) {
                stacks.forEach(stack => {
                    cats.forEach(cat => {
                        const dir = path.join(tsRoot, stack, cat);
                        if (!fs.existsSync(dir)) return;

                        fs.readdirSync(dir)
                            .filter(f => /\.(ts|tsx|go|kt|py|dart)$/.test(f))
                            .forEach(tf => {
                                const name = tf.replace(/\.(ts|tsx|go|kt|py|dart)$/, "").toLowerCase();
                                const key = `${cat}/${capitalize(name)}/${stack}`;
                                const fp = batchResults.get(key);

                                if (fp) {
                                    const list = groups.get(name) || [];
                                    list.push({ stack, cat, fp, path: path.join(dir, tf) });
                                    groups.set(name, list);
                                }
                            });
                    });
                });
                return groups;
            }
        } catch {
            // gRPC hub not available — fall through to local extraction
        }

        // Fallback to sequential scanning if batch failed
        for (const stack of stacks) {
            for (const cat of cats) {
                const dir = path.join(tsRoot, stack, cat);
                if (fs.existsSync(dir)) {
                    await this.scanDir(dir, stack, cat, groups);
                }
            }
        }
        return groups;
    }

    private static async scanDir(dir: string, stack: string, cat: string, groups: Map<string, any[]>) {
        const files = fs.readdirSync(dir).filter(f => /\.(ts|tsx|go|kt|py|dart)$/.test(f));
        for (const tf of files) {
            const name = tf.replace(/\.(ts|tsx|go|kt|py|dart)$/, "").toLowerCase();
            const content = fs.readFileSync(path.join(dir, tf), "utf-8");
            const fp = tf.endsWith(".py")
                ? await extractPythonFingerprint(content, capitalize(name))
                : await extractTSFingerprint(content, capitalize(name));

            if (fp) {
                const list = groups.get(name) || [];
                list.push({ stack, cat, fp, path: path.join(dir, tf) });
                groups.set(name, list);
            }
        }
    }
}
