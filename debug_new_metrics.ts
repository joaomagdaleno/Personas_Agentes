import { Orchestrator } from "./src_local/core/orchestrator";

async function main() {
    const orc = new Orchestrator(".");

    console.log("🔍 Debugando novas métricas de penalidade...");

    const ctx = await orc.contextEngine.analyzeProject();

    const { QualityAnalyst } = await import("./src_local/agents/Support/Diagnostics/quality_analyst");
    const qa = new QualityAnalyst();
    const matrix = qa.calculateConfidenceMatrix(ctx.map);

    const stats = {
        ccHigh: 0, cognitiveHigh: 0, nestingDeep: 0, cboHigh: 0,
        miLow: 0, defectHigh: 0, riskCritical: 0, gateRed: 0, shadowNonComp: 0,
        miExcellent: 0, gateGreen: 0, shadowComp: 0, ccLow: 0, riskLow: 0
    };

    const countMetrics = (m: any) => {
        const d = m.advanced_metrics || {};
        const check = (cond: boolean, key: keyof typeof stats) => cond && (stats[key] as any)++;

        check(d.cyclomaticComplexity > 20, "ccHigh");
        check(d.cognitiveComplexity > 30, "cognitiveHigh");
        check(d.nestingDepth > 5, "nestingDeep");
        check(d.cbo > 10, "cboHigh");
        check(d.maintainabilityIndex > 0 && d.maintainabilityIndex < 15, "miLow");
        check(d.defectDensity > 1, "defectHigh");
        check(d.riskLevel === "CRITICAL", "riskCritical");
        check(d.qualityGate === "RED", "gateRed");
        const nc = d.isShadow && d.shadowCompliance && !d.shadowCompliance.compliant;
        check(!!nc, "shadowNonComp");

        check(d.maintainabilityIndex >= 20, "miExcellent");
        if (d.maintainabilityIndex >= 50) stats.miExcellent += 2;
        check(d.qualityGate === "GREEN", "gateGreen");
        check(!!(d.isShadow && d.shadowCompliance?.compliant), "shadowComp");
        check(d.cyclomaticComplexity <= 10, "ccLow");
        check(d.riskLevel === "LOW", "riskLow");
    };

    for (const m of matrix) countMetrics(m);

    const printStats = (s: typeof stats) => {
        console.log("\n📊 Penalidades (9+ Métricas):");
        const p = [
            ["CC > 20", s.ccHigh, 2.0], ["Cognitive > 30", s.cognitiveHigh, 1.5],
            ["Nesting > 5", s.nestingDeep, 1.0], ["CBO > 10", s.cboHigh, 1.5],
            ["MI < 15", s.miLow, 2.0], ["Defect > 1/KLOC", s.defectHigh, 3.0],
            ["Risk CRITICAL", s.riskCritical, 5.0], ["Gate RED", s.gateRed, 2.0],
            ["Shadow Non-Comp", s.shadowNonComp, 4.0]
        ];
        let totalP = 0;
        p.forEach(([label, count, weight]: any) => {
            console.log(`   ${label.padEnd(17)}: ${count} × ${weight} = ${count * weight}`);
            totalP += count * weight;
        });
        console.log(`\n   TOTAL PENALTY: ${totalP}`);

        console.log("\n📊 Bônus de Qualidade:");
        const b = [
            ["MI >= 20", s.miExcellent, 0.5], ["Gate GREEN", s.gateGreen, 0.3],
            ["Shadow Compliant", s.shadowComp, 2.0], ["CC <= 10", s.ccLow, 0.2],
            ["Risk LOW", s.riskLow, 0.3]
        ];
        let totalB = 0;
        b.forEach(([label, count, weight]: any) => {
            console.log(`   ${label.padEnd(17)}: ${count} × ${weight} = ${count * weight}`);
            totalB += count * weight;
        });
        console.log(`\n   TOTAL BONUS: ${totalB.toFixed(1)}`);
    };

    printStats(stats);
}

main().catch(console.error);
