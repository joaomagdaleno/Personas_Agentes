import { Orchestrator } from "./src_local/core/orchestrator";

async function main() {
    const orc = new Orchestrator(".");
    
    try {
        console.log("🔍 Iniciando análise de stabilidade (coverage)...");
        
        const ctx = await orc.contextEngine.analyzeProject();
        
        const { QualityAnalyst } = await import("./src_local/agents/Support/Diagnostics/quality_analyst");
        const qa = new QualityAnalyst();
        const qaData = { matrix: qa.calculateConfidenceMatrix(ctx.map) };
        
        console.log("\n📊 QA Matrix:");
        console.log(`Total entries: ${qaData.matrix.length}`);
        
        const shallowTests = qaData.matrix.filter(m => m.test_status === "SHALLOW");
        console.log(`\n📉 Testes rasos (SHALLOW): ${shallowTests.length}`);
        
        shallowTests.slice(0, 20).forEach(m => {
            const file = m.file;
            const info = ctx.map[file];
            console.log(`- ${file} (${info.component_type}): ${m.test_status}`);
        });
        
    } catch (error) {
        console.error("❌ Erro:", error);
    }
}

main();