import { Orchestrator } from "./src_local/core/orchestrator";
import { PenaltyEngine } from "./src_local/agents/Support/Core/penalty_engine";

async function main() {
    const orc = new Orchestrator(".");
    
    try {
        console.log("🔍 Analisando penalidades detalhadas...");
        
        const ctx = await orc.contextEngine.analyzeProject();
        const auditFindings = await orc.runStrategicAudit(ctx, null, true);
        const obfuscationFindings = await orc.runObfuscationScan();
        const allFindings = [...auditFindings, ...obfuscationFindings];
        
        const { QualityAnalyst } = await import("./src_local/agents/Support/Diagnostics/quality_analyst");
        const qa = new QualityAnalyst();
        const qaData = { matrix: qa.calculateConfidenceMatrix(ctx.map) };
        
        const engine = new PenaltyEngine();
        const adjustments = engine.getPilarAdjustments(allFindings, ctx.map, qaData);
        
        console.log("\n📊 Penalties por pilar:");
        Object.entries(adjustments).forEach(([pilar, valor]) => {
            console.log(`- ${pilar}: ${valor}`);
        });
        
        const totalDrain = Object.values(adjustments).reduce((sum, v) => sum + v, 0);
        console.log(`\n💧 Total Drain: ${totalDrain}`);
        
        const { ScoringMetricsEngine } = await import("./src_local/agents/Support/Diagnostics/scoring_metrics_engine");
        const metricsEngine = new ScoringMetricsEngine();
        
        const [stability] = metricsEngine.calcStability(ctx.map);
        const [purity] = metricsEngine.calcPurity(ctx.map, Object.keys(ctx.map).length);
        const [observability] = metricsEngine.calcObservability(ctx.map);
        const [security] = metricsEngine.calcSecurity(allFindings);
        const [excellence] = metricsEngine.calcExcellence(ctx.map, Object.keys(ctx.map).length);
        
        const totalRaw = stability + purity + observability + security + excellence;
        
        console.log("\n📈 Pontuação Bruta:");
        console.log(`- Stability: ${stability}`);
        console.log(`- Purity: ${purity}`);
        console.log(`- Observability: ${observability}`);
        console.log(`- Security: ${security}`);
        console.log(`- Excellence: ${excellence}`);
        console.log(`- Total: ${totalRaw}`);
        
        const final = engine.apply(totalRaw, allFindings, ctx.map, Object.keys(ctx.map).length, qaData);
        console.log(`\n🎯 Score Final: ${final}`);
        
    } catch (error) {
        console.error("\n❌ Erro:", error);
        console.error(error.stack);
    }
}

main();