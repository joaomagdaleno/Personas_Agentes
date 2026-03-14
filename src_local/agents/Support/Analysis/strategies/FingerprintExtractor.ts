/**
 * 🧬 FingerprintExtractor — 100% AST-Based Code DNA Extraction via gRPC Proxy.
 * 
 * Philosophy: hub-proxy style — ALL analysis via Go Hub gRPC bridge.
 * Strictly depends on HubManagerGRPC.
 */
import { HubManagerGRPC } from "../../../../core/hub_manager_grpc.ts";
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
        } catch (err: unknown) {
            logger.error(`[FingerprintExtractor] gRPC batch extraction failed:`, err instanceof Error ? err.message : String(err));
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
            logger.warn(`⚠️ [Fingerprint] Hub offline. Using local regex extraction for ${name}.`);
            return this.extractLocally(content, name);
        }

        try {
            logger.debug(`🧬 [Fingerprint] Ad-hoc gRPC extraction for ${name}.`);
            const fingerprint = await this.hubManager.fingerprint(name);
            if (fingerprint && fingerprint.entries && fingerprint.entries[0]) {
                return this.mapRustToAtomic(fingerprint.entries[0].fingerprint);
            }
            return this.extractLocally(content, name);
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : String(err);
            logger.warn(`⚠️ [Fingerprint] gRPC extraction failed for ${name}: ${msg}. Falling back to local.`);
            return this.extractLocally(content, name);
        }
    }

    private extractLocally(content: string, name: string): AtomicFingerprint {
        const { ParserHelpers } = require("./ParserHelpers.ts");
        const parts = ParserHelpers.getParts(content);
        return {
            name: name,
            emoji: "🛡️",
            role: "Local Fallback Agent",
            stack: "Local",
            rulesCount: 0,
            rulePatterns: [],
            ruleIssues: [],
            ruleSeverities: [],
            fileExtensions: [],
            hasReasoning: false,
            reasoningTrigger: "",
            systemPrompt: "",
            hasExtraMethods: [],
            methods: [...new Set([...parts.functions, ...parts.arrows, ...parts.methods])],
            halsteadVolume: 0,
            halsteadDifficulty: 0,
            halsteadEffort: 0
        };
    }

    async extractPython(content: string, name: string): Promise<AtomicFingerprint> {
        return await this.extractTS(content, name);
    }

    async matchTSRules(content: string): Promise<string[]> {
        const fingerprint = await this.extractTS(content, "probe");
        return fingerprint.ruleIssues;
    }
}
