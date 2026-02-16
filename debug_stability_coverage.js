import { Orchestrator } from "./src_local/core/orchestrator";

async function main() {
    const orc = new Orchestrator(".");
    
    try {
        console.log("🔍 Analisando detalhadamente a penalidade de Stability (Coverage)...");
        
        const ctx = await orc.contextEngine.analyzeProject();
        
        const { QualityAnalyst } = await import("./src_local/agents/Support/Diagnostics/quality_analyst");
        const qa = new QualityAnalyst();
        const qaData = { matrix: qa.calculateConfidenceMatrix(ctx.map) };
        
        const coreTypes = ["AGENT", "CORE", "LOGIC", "UTIL"];
        
        console.log(`📊 Total de arquivos: ${Object.keys(ctx.map).length}`);
        console.log(`📊 Entradas na matriz QA: ${qaData.matrix.length}`);
        
        const shallowCore = qaData.matrix.filter(m => {
            const info = ctx.map[m.file];
            return m.test_status === "SHALLOW" && info && coreTypes.includes(info.component_type);
        });
        
        console.log(`\n📉 Arquivos CORE/LOGIC com testes SHALLOW: ${shallowCore.length}`);
        
        shallowCore.forEach(m => {
            const info = ctx.map[m.file];
            console.log(`- ${m.file}`);
            console.log(`  Component Type: ${info.component_type}`);
            console.log(`  Complexidade: ${info.complexity}`);
            console.log();
        });
        
    } catch (error) {
        console.error("\n❌ Erro:", error);
        console.error(error.stack);
    }
}

main();