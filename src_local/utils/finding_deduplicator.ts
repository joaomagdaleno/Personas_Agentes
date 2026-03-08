import winston from "winston";
import * as cp from "node:child_process";
import * as path from "node:path";
import * as fs from "node:fs";

const logger = winston.child({ module: "FindingDeduplicator" });

/**
 * 🔬 Assistente de Deduplicação Forense (Rust-Enhanced).
 */
export class FindingDeduplicator {
    private static BINARY_PATH = path.resolve(process.cwd(), "src_native/analyzer/target/release/analyzer.exe");

    deduplicate(allRawFindings: any[]): any[] {
        if (allRawFindings.length === 0) return [];

        if (!fs.existsSync(FindingDeduplicator.BINARY_PATH)) {
            logger.error("🚨 Critical: analyzer.exe not found. Deduplication aborted.");
            return allRawFindings;
        }

        try {
            return this.deduplicateWithRust(allRawFindings);
        } catch (err) {
            logger.error("❌ Rust deduplication failed", { error: err });
            return allRawFindings;
        }
    }

    private deduplicateWithRust(findings: any[]): any[] {
        const tmpFile = path.join(process.cwd(), `tmp_dedup_${Date.now()}.json`);
        fs.writeFileSync(tmpFile, JSON.stringify(findings));

        try {
            const output = cp.execSync(`"${FindingDeduplicator.BINARY_PATH}" deduplicate "${tmpFile}"`, {
                encoding: 'utf8',
                maxBuffer: 100 * 1024 * 1024
            });
            return JSON.parse(output);
        } finally {
            if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile);
        }
    }
}

