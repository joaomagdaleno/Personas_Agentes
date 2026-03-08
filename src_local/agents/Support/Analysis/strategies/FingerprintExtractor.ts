/**
 * 🧬 FingerprintExtractor — 100% AST-Based Code DNA Extraction
 * 
 * Philosophy: rust-analyzer style — ALL analysis via AST walking in Rust.
 * TypeScript fallback removed. Strictly depends on analyzer.exe.
 */
import * as cp from "child_process";
import * as path from "path";
import * as fs from "fs";
import type { AtomicFingerprint } from "../parity_types.ts";

export class FingerprintExtractor {
    private static BINARY_PATH = path.resolve(process.cwd(), "src_native/analyzer/target/release/analyzer.exe");

    /**
     * Batch extract all fingerprints using the high-performance Rust analyzer.
     * Processes all stacks and categories in parallel via rayon.
     */
    static batchExtract(agentsRoot: string): Map<string, AtomicFingerprint> {
        const result = new Map<string, AtomicFingerprint>();

        this.ensureBinaryPresence();

        try {
            const output = cp.execSync(`"${this.BINARY_PATH}" fingerprint "${agentsRoot}"`, { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 });
            const report = JSON.parse(output);

            for (const entry of report.entries) {
                if (entry.agent === "__init__") continue;
                // Use the same key format: category/AgentName/Stack
                const key = `${entry.category}/${entry.agent}/${entry.stack}`;
                result.set(key, this.mapRustToAtomic(entry.fingerprint));
            }
        } catch (err) {
            console.error(`[FingerprintExtractor] Rust batch extraction failed:`, err);
            throw new Error(`[FingerprintExtractor] Ocorreu um erro ao executar a extração nativa.`);
        }

        return result;
    }

    private static mapRustToAtomic(f: any): AtomicFingerprint {
        return {
            name: f.name,
            emoji: f.emoji,
            role: f.role,
            stack: f.stack,
            rulesCount: f.rules_count,
            rulePatterns: f.rule_issues.map((_: any, i: number) => `P${i}`),
            ruleIssues: f.rule_issues,
            ruleSeverities: f.rule_severities,
            fileExtensions: f.file_extensions,
            hasReasoning: f.has_reasoning,
            reasoningTrigger: "",
            systemPrompt: f.system_prompt,
            hasExtraMethods: f.extra_methods,
            methods: f.methods,
            halsteadVolume: f.halstead_volume || 0,
            halsteadDifficulty: f.halstead_difficulty || 0,
            halsteadEffort: f.halstead_effort || 0
        };
    }

    static extractTS(content: string, name: string): AtomicFingerprint {
        this.ensureBinaryPresence();
        try {
            // Write a single temp file. We could pass via stdin, but analyzer.exe currently expects a path.
            const tmpFile = path.join(process.cwd(), `tmp_fp_${Date.now()}.ts`);
            fs.writeFileSync(tmpFile, content);

            const output = cp.execSync(`"${this.BINARY_PATH}" fingerprint "${tmpFile}"`, { encoding: 'utf8' });
            if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile);

            const report = JSON.parse(output);
            const entry = report.entries[0];
            if (entry) return this.mapRustToAtomic(entry.fingerprint);
            throw new Error("No fingerprint entry returned by Rust analyzer.");
        } catch (err: any) {
            throw new Error(`[FingerprintExtractor] Falha na extração de fingerprint (TS): ${err.message}`);
        }
    }

    static extractPython(content: string, name: string): AtomicFingerprint {
        // Enforce same path as TS — strictly Rust
        return this.extractTS(content, name);
    }

    private static ensureBinaryPresence() {
        if (!fs.existsSync(this.BINARY_PATH)) {
            console.error(`[FATAL] Rust binary not found at ${this.BINARY_PATH}.`);
            console.error(`[FATAL] O sistema exige que os binários nativos de Rust estejam compilados.`);
            console.error(`[FATAL] Execute 'cargo build --release' em 'src_native/analyzer'.`);
            process.exit(1);
        }
    }

    static matchTSRules(content: string): string[] {
        const fingerprint = this.extractTS(content, "probe");
        return fingerprint.ruleIssues;
    }
}
