import winston from "winston";
import * as cp from "node:child_process";
import * as path from "node:path";
import * as fs from "node:fs";
import { Path } from "../../../core/path_utils.ts";

const logger = winston.child({ module: "ConnectivityMapper" });

/**
 * 🌐 Mapeador de Conectividade PhD (Rust-Enhanced).
 */
export class ConnectivityMapper {
    private static BINARY_PATH = path.resolve(process.cwd(), "src_native/analyzer/target/release/analyzer.exe");

    /**
     * Calcula acoplamento de TODOS os arquivos em uma única passada Rust (O(n)).
     */
    calculateBulk(allMap: Record<string, any>): Record<string, { in: number, out: number, instability: number }> {
        if (!fs.existsSync(ConnectivityMapper.BINARY_PATH)) {
            logger.warn("Rust binary missing, bulk connectivity analysis skipped");
            return {};
        }

        const input: Record<string, { dependencies: string[] }> = {};
        Object.entries(allMap).forEach(([f, data]) => {
            input[f] = { dependencies: data.dependencies || [] };
        });

        const tmpFile = path.join(process.cwd(), `tmp_conn_${Date.now()}.json`);
        fs.writeFileSync(tmpFile, JSON.stringify(input));

        try {
            const output = cp.execSync(`${ConnectivityMapper.BINARY_PATH} connectivity ${tmpFile}`, {
                encoding: 'utf8',
                maxBuffer: 50 * 1024 * 1024
            });
            const results = JSON.parse(output);
            const mapping: Record<string, any> = {};

            results.forEach((r: any) => {
                mapping[r.file] = { in: r.afferent, out: r.eferent, instability: r.instability };
            });

            return mapping;
        } catch (err) {
            logger.error("Rust connectivity analysis failed:", err);
            return {};
        } finally {
            if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile);
        }
    }

    calculateMetrics(filePath: string, data: any, allMap: Record<string, any>): any {
        const startTime = Date.now();
        const eferent = (data.dependencies || []).length;
        let afferent = 0;
        const fileStem = new Path(filePath).stem();

        for (const [otherFile, otherData] of Object.entries(allMap)) {
            if (otherFile === filePath) continue;
            const deps = otherData.dependencies || [];
            if (deps.some((imp: string) => imp.includes(fileStem))) {
                afferent += 1;
            }
        }

        const instability = (afferent + eferent) > 0 ? eferent / (afferent + eferent) : 0;
        const duration = (Date.now() - startTime) / 1000;
        logger.debug(`⏱️ [Connectivity] Single analysis for ${filePath} in ${duration.toFixed(4)}s`);

        return { in: afferent, out: eferent, instability: instability };
    }
}
