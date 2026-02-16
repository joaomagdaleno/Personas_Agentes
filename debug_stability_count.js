import { Orchestrator } from "./src_local/core/orchestrator";
import { PenaltyEngine } from "./src_local/agents/Support/Core/penalty_engine";

async function main() {
    const orc = new Orchestrator(".");
    
    try {
        console.log("🔍 Iniciando análise de contagem de penalidades...");
        
        const ctx = await orc.contextEngine.analyzeProject();
        const auditFindings = await orc.runStrategicAudit(ctx, null, true);
        const obfuscationFindings = await orc.runObfuscationScan();
        const allFindings = [...auditFindings, ...obfuscationFindings];
        
        const { QualityAnalyst } = await import("./src_local/agents/Support/Diagnostics/quality_analyst");
        const qa = new QualityAnalyst();
        const qaData = { matrix: qa.calculateConfidenceMatrix(ctx.map) };
        
        const engine = new PenaltyEngine();
        const adjustments = engine.getPilarAdjustments(allFindings, ctx.map, qaData);
        
        console.log("🏆 Health breakdown:");
        console.log(JSON.stringify(adjustments, null, 2));
        
        // Detailed count of shallow tests per component type
        const coreTypes = ["AGENT", "CORE", "LOGIC", "UTIL"];
        const shallowByType = {};
        coreTypes.forEach(type => shallowByType[type] = 0);
        
        qaData.matrix.forEach(m => {
            if (m.test_status === "SHALLOW") {
                const info = ctx.map[m.file];
                if (info) {
                    if (coreTypes.includes(info.component_type)) {
                        shallowByType[info.component_type]++;
                    }
                }
            }
        });
        
        console.log("\n📉 Shallow tests by component type:");
        Object.entries(shallowByType).forEach(([type, count]) => {
            console.log(`- ${type}: ${count}`);
        });
        
        console.log(`\nTotal shallow tests: ${Object.values(shallowByType).reduce((a, b) => a + b, 0)}`);
        
    } catch (error) {
        console.error("❌ Erro:", error);
    }
}

main();