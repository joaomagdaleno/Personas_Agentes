import winston from "winston";
import { Path } from "./path_utils";
import { MarkdownSanitizer } from "../agents/Support/Reporting/markdown_sanitizer.ts";
import { MarkdownAuditor } from "../agents/Support/Reporting/markdown_auditor.ts";
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

        // 🧠 Ativando Cognição Sistêmica
        orc.reflexEngine.triggerReflexes(snapshot, findings);

        // 📥 Agendamento de Autocura (Task Queue)
        if (snapshot.dark_matter && snapshot.dark_matter.length > 0) {
            const mudos = snapshot.dark_matter.slice(0, 5);
            for (const path of mudos) {
                orc.taskQueue.enqueue("DOC_GEN", path);
            }
        }

        // Memorizando achados importantes
        for (const finding of findings.slice(0, 10)) {
            orc.memoryEngine.rememberFinding(finding);
        }

        // Finalize report
        return await this.persistReport(orc, snapshot, findings);
    }

    private static async persistReport(orc: any, snapshot: any, findings: any[]): Promise<Path> {
        if (process.env.DIAGNOSTIC_TEST_MODE === "1") {
            return new Path("test_report_suppressed.md");
        }

        let report = await orc.director.format360Report(snapshot, findings);

        // 🛡️ Sanitize Markdown (Compliance MD041, MD047, MD022, MD032)
        const sanitizer = new MarkdownSanitizer();
        report = await sanitizer.sanitize(report);

        const path = orc.projectRoot.join("docs", "auto_healing_VERIFIED.md");

        await Bun.write(path.toString(), report);

        // 🕵️ Final Quality Control (PhD Audit)
        const auditor = new MarkdownAuditor();
        const errors = auditor.auditFile(path.toString());
        if (errors.length > 0) {
            logger.warn(`⚠️ [Finalizer] Relatório persistido com ${errors.length} violações de estilo PhD.`);
        } else {
            logger.info("✅ [Finalizer] Relatório validado 100% conforme normas PhD.");
        }

        return path;
    }
}
