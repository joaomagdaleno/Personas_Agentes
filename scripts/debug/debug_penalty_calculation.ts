import { Orchestrator } from "../../src_local/core/orchestrator";
import { PenaltyEngine } from "../../src_local/agents/Support/Core/penalty_engine";

async function main() {
    const orc = new Orchestrator(".");
    
    try {
        console.log("🔍 Analisando cálculo de penalidades...");
        
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
        
        const coreTypes = ["AGENT", "CORE", "LOGIC", "UTIL"];
        const shallowCount = qaData.matrix.filter(m => {
            const info = ctx.map[m.file];
            return m.test_status === "SHALLOW" && coreTypes.includes(info.component_type);
        }).length;
        
        console.log(`\n📉 Arquivos SHALLOW em core types: ${shallowCount}`);
        
        console.log("\n📄 Detalhe dos arquivos SHALLOW:");
        qaData.matrix.filter(m => {
            const info = ctx.map[m.file];
            return m.test_status === "SHALLOW" && coreTypes.includes(info.component_type);
        }).slice(0, 20).forEach(m => {
            const info = ctx.map[m.file];
            console.log(`${m.file} (${info.component_type}) - Complexidade: ${m.complexity}, Assertions: ${m.assertions}, Ratio: ${m.coverage_ratio}`);
        });
        
    } catch (error) {
        console.error("\n❌ Erro:", error);
        console.error(error.stack);
    }
}

main();
