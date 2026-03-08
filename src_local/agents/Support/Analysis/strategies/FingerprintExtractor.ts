/**
 * 🧬 FingerprintExtractor — 100% AST-Based Code DNA Extraction via gRPC Proxy.
 * 
 * Philosophy: hub-proxy style — ALL analysis via Go Hub gRPC bridge.
 * Strictly depends on HubManagerGRPC.
 */
import { HubManagerGRPC } from "../../../../core/hub_manager_grpc";
import type { AtomicFingerprint } from "../parity_types.ts";
import winston from "winston";

const logger = winston.child({ module: "FingerprintExtractor" });

export class FingerprintExtractor {
    constructor(private hubManager?: HubManagerGRPC) { }

    /**
     * Batch extract all fingerprints using the Go Hub proxy.
     */
    async batchExtract(agentsRoot: string): Promise<Map<string, AtomicFingerprint>> {
        const result = new Map<string, AtomicFingerprint>();

        if (!this.hubManager) {
            logger.warn("⚠️ HubManager not provided to FingerprintExtractor. Returning empty map.");
            return result;
        }

        try {
            logger.info(`🧬 [Fingerprint] Batch extracting from: ${agentsRoot}`);
            const report = await this.hubManager.fingerprint(agentsRoot);

            if (report && report.entries) {
                for (const entry of report.entries) {
                    if (entry.agent === "__init__") continue;
                    const key = `${entry.category}/${entry.agent}/${entry.stack}`;
                    result.set(key, this.mapRustToAtomic(entry.fingerprint));
                }
            }
        } catch (err) {
            logger.error(`[FingerprintExtractor] gRPC batch extraction failed:`, err);
        }

        return result;
    }

    private mapRustToAtomic(f: any): AtomicFingerprint {
        return {
            name: f.name,
            emoji: f.emoji,
            role: f.role,
            stack: f.stack,
            rulesCount: f.rules_count,
            rulePatterns: f.rule_issues ? f.rule_issues.map((_: any, i: number) => `P${i}`) : [],
            ruleIssues: f.rule_issues || [],
            ruleSeverities: f.rule_severities || [],
            fileExtensions: f.file_extensions || [],
            hasReasoning: f.has_reasoning,
            reasoningTrigger: "",
            systemPrompt: f.system_prompt,
            hasExtraMethods: f.extra_methods,
            methods: f.methods || [],
            halsteadVolume: f.halstead_volume || 0,
            halsteadDifficulty: f.halstead_difficulty || 0,
            halsteadEffort: f.halstead_effort || 0
        };
    }

    async extractTS(content: string, name: string): Promise<AtomicFingerprint> {
        if (!this.hubManager) {
            throw new Error("HubManager not provided to FingerprintExtractor.");
        }

        try {
            logger.warn(`🧬 [Fingerprint] Ad-hoc content extraction requested for ${name}. This currently uses a disk fallback approach in the Hub.`);

            const fingerprint = await this.hubManager.fingerprint(name);
            if (fingerprint && fingerprint.entries && fingerprint.entries[0]) {
                return this.mapRustToAtomic(fingerprint.entries[0].fingerprint);
            }
            throw new Error("No fingerprint returned.");
        } catch (err: any) {
            throw new Error(`[FingerprintExtractor] Falha na extração de fingerprint (gRPC): ${err.message}`);
        }
    }

    async extractPython(content: string, name: string): Promise<AtomicFingerprint> {
        return await this.extractTS(content, name);
    }

    async matchTSRules(content: string): Promise<string[]> {
        const fingerprint = await this.extractTS(content, "probe");
        return fingerprint.ruleIssues;
    }
}
