import { Orchestrator } from "./src_local/core/orchestrator";

async function main() {
    const orc = new Orchestrator(".");
    
    try {
        console.log("🔍 Analisando qualidade de testes após refatoração...");
        
        const ctx = await orc.contextEngine.analyzeProject();
        
        const { QualityAnalyst } = await import("./src_local/agents/Support/Diagnostics/quality_analyst");
        const qa = new QualityAnalyst();
        const qaData = { matrix: qa.calculateConfidenceMatrix(ctx.map) };
        
        const coreTypes = ["AGENT", "CORE", "LOGIC", "UTIL"];
        const shallowCore = qaData.matrix.filter(m => {
            const info = ctx.map[m.file];
            return m.test_status === "SHALLOW" && info && coreTypes.includes(info.component_type);
        });
        
        const deepCore = qaData.matrix.filter(m => {
            const info = ctx.map[m.file];
            return m.test_status === "DEEP" && info && coreTypes.includes(info.component_type);
        });
        
        console.log(`📉 Testes rasos em componentes core: ${shallowCore.length}`);
        console.log(`📈 Testes profundos em componentes core: ${deepCore.length}`);
        
        const percentageDeep = (deepCore.length / (shallowCore.length + deepCore.length) * 100).toFixed(1);
        console.log(`📊 Porcentagem de testes profundos: ${percentageDeep}%`);
        
    } catch (error) {
        console.error("\n❌ Erro:", error);
        console.error(error.stack);
    }
}

main();