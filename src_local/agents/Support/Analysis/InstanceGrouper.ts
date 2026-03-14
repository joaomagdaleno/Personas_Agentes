import * as fs from "node:fs";
import * as path from "node:path";
import { extractPythonFingerprint, extractTSFingerprint, capitalize } from "./parity_utils";
import { FingerprintExtractor } from "./strategies/FingerprintExtractor";
import type { AgentInstance } from "./parity_types";
import { HubManagerGRPC } from "../../../core/hub_manager_grpc.ts";
import winston from "winston";

const logger = winston.child({ module: "InstanceGrouper" });

/**
 * 📂 InstanceGrouper — Helper for grouping agent instances across stacks.
 */
export class InstanceGrouper {
    static async group(tsRoot: string): Promise<Map<string, AgentInstance[]>> {
        const groups = new Map<string, AgentInstance[]>();
        const stacks = ["Bun", "Flutter", "Go", "Kotlin", "Python", "Rust", "TypeScript"];
        const cats = ["Audit", "Content", "Strategic", "System"];

        // Try batch extraction first (Rust-powered via gRPC)
        try {
            const hub = new HubManagerGRPC();
            const status = await hub.getStatus();
            const extractor = status ? new FingerprintExtractor(hub) : new FingerprintExtractor();
            if (status) logger.info("✅ [InstanceGrouper] Hub gRPC conectado — usando fingerprint AST nativo.");
            else logger.warn("⚠️ [InstanceGrouper] Hub não respondeu — usando fallback local.");
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
        } catch (error: unknown) {
            logger.warn("⚠️ [InstanceGrouper] Erro ao tentar batch extraction via Hub:", error instanceof Error ? error.message : String(error));
            // gRPC hub not available or failed — fall through to local extraction
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

    private static async scanDir(dir: string, stack: string, cat: string, groups: Map<string, AgentInstance[]>) {
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
