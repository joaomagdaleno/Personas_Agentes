import { PenaltyEngine } from "./src_local/agents/Support/Core/penalty_engine";
import { Orchestrator } from "./src_local/core/orchestrator";

async function main() {
    const orc = new Orchestrator(".");
    
    try {
        console.log("🔍 Iniciando análise detalhada de alertas...");
        
        const ctx = await orc.contextEngine.analyzeProject();
        const auditFindings = await orc.runStrategicAudit(ctx, null, true);
        const obfuscationFindings = await orc.runObfuscationScan();
        const allFindings = [...auditFindings, ...obfuscationFindings];
        
        const { QualityAnalyst } = await import("./src_local/agents/Support/Diagnostics/quality_analyst");
        const qa = new QualityAnalyst();
        const qaData = { matrix: qa.calculateConfidenceMatrix(ctx.map) };
        
        const engine = new PenaltyEngine();
        const adjustments = engine.getPilarAdjustments(allFindings, ctx.map, qaData);
        
        console.log("\n📊 Alertas detalhados:");
        console.log(`Total: ${allFindings.length}`);
        
        console.log("\n🏆 Health breakdown:");
        console.log(JSON.stringify(adjustments, null, 2));
        
        const { ScoringMetricsEngine } = await import("./src_local/agents/Support/Diagnostics/scoring_metrics_engine");
        const metricsEngine = new ScoringMetricsEngine();
        
        const [stability, ,] = metricsEngine.calcStability(ctx.map);
        const [purity,] = metricsEngine.calcPurity(ctx.map, Object.keys(ctx.map).length);
        const [observability, ,] = metricsEngine.calcObservability(ctx.map);
        const [security,] = metricsEngine.calcSecurity(allFindings);
        const [excellence,] = metricsEngine.calcExcellence(ctx.map, Object.keys(ctx.map).length);
        
        console.log("\n📈 Métricas cruas:");
        console.log(`- Stability: ${stability}`);
        console.log(`- Purity: ${purity}`);
        console.log(`- Observability: ${observability}`);
        console.log(`- Security: ${security}`);
        console.log(`- Excellence: ${excellence}`);
        
        const totalRaw = stability + purity + observability + security + excellence;
        const totalDrain = Object.values(adjustments).reduce((sum, v) => sum + v, 0);
        
        console.log(`\n💯 Total Raw: ${totalRaw}`);
        console.log(`💧 Total Drain: ${totalDrain}`);
        
    } catch (error) {
        console.error("❌ Erro:", error);
    }
}

main();