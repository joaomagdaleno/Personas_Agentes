import winston from "winston";
import { Path } from "./path_utils";
// import { HistoryAgent } from "../utils/history_agent"; // To be ported

const logger = winston.child({ module: "DiagnosticFinalizer" });

export class DiagnosticFinalizer {
    static async finalize(pipeline: any, ctx: any, health: any, findings: any[], dryRun: boolean = false): Promise<Path> {
        const orc = pipeline.orc;
        const snapshot = await orc.getSystemHealth360(ctx, health, findings);

        logger.info(`✨ Finalizando diagnóstico com score: ${snapshot.health_score}%`);

        if (dryRun) {
            logger.info("🛡️ [DryRun] Snapshot gerado, mas persistência ignorada.");
            return new Path("dry_run_report.md");
        }

        // Database and history logic
        orc.historyAgent.recordSnapshot(
            snapshot.health_score,
            findings.length,
            0, // Entropy placeholder
            snapshot.health_breakdown
        );

        // Finalize report
        return await this.persistReport(orc, snapshot, findings);
    }

    private static async persistReport(orc: any, snapshot: any, findings: any[]): Promise<Path> {
        if (process.env.DIAGNOSTIC_TEST_MODE === "1") {
            return new Path("test_report_suppressed.md");
        }

        const report = await orc.director.format360Report(snapshot, findings);
        const path = orc.projectRoot.join("docs", "auto_healing_VERIFIED.md");

        await Bun.write(path.toString(), report);
        return path;
    }
}
