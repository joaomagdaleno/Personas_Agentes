import { PenaltyEngine } from "./src_local/agents/Support/Core/penalty_engine";
import { Orchestrator } from "./src_local/core/orchestrator";

async function main() {
    const orc = new Orchestrator(".");
    
    try {
        console.log("🔍 Iniciando análise de penalidades...");
        
        const ctx = await orc.contextEngine.analyzeProject();
        const auditFindings = await orc.runStrategicAudit(ctx, null, true);
        const obfuscationFindings = await orc.runObfuscationScan();
        const allFindings = [...auditFindings, ...obfuscationFindings];
        
        const engine = new PenaltyEngine();
        
        console.log("\n📊 Alertas encontrados:");
        console.log(`Total: ${allFindings.length}`);
        
        const adjustments = engine.getPilarAdjustments(allFindings, ctx.map);
        console.log("\n💰 Penalties aplicadas:");
        console.log(JSON.stringify(adjustments, null, 2));
        
        const totalDrain = Object.values(adjustments).reduce((sum, v) => sum + v, 0);
        console.log(`\n💧 Total Drain: ${totalDrain}`);
        
    } catch (error) {
        console.error("❌ Erro:", error);
    }
}

main();