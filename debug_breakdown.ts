import { Orchestrator } from "./src_local/core/orchestrator";

async function main() {
    const orc = new Orchestrator(".");
    const ctx = await orc.contextEngine.analyzeProject();
    
    const { QualityAnalyst } = await import("./src_local/agents/Support/Diagnostics/quality_analyst");
    const { ScoreCalculator } = await import("./src_local/agents/Support/Diagnostics/score_calculator");
    
    const qa = new QualityAnalyst();
    const sc = new ScoreCalculator();
    
    const matrix = qa.calculateConfidenceMatrix(ctx.map);
    const qaData = { matrix };
    
    const { score, breakdown } = sc.calculateFinalScore(ctx.map, [], qaData);
    
    console.log("=== BREAKDOWN ===");
    console.log(JSON.stringify(breakdown, null, 2));
}

main().catch(console.error);
