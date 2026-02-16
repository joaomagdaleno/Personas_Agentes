import { Orchestrator } from "./src_local/core/orchestrator";

async function main() {
    const orc = new Orchestrator(".");
    
    try {
        console.log("🔍 Analisando problemas de qualidade de testes...");
        
        const ctx = await orc.contextEngine.analyzeProject();
        
        const { QualityAnalyst } = await import("./src_local/agents/Support/Diagnostics/quality_analyst");
        const qa = new QualityAnalyst();
        const qaData = { matrix: qa.calculateConfidenceMatrix(ctx.map) };
        
        const coreTypes = ["AGENT", "CORE", "LOGIC", "UTIL"];
        const shallowCore = qaData.matrix.filter(m => {
            const info = ctx.map[m.file];
            return m.test_status === "SHALLOW" && info && coreTypes.includes(info.component_type);
        });
        
        console.log(`📉 Testes rasos em componentes core: ${shallowCore.length}`);
        
        // Identificar arquivos com testes rasos e complexidade alta
        console.log("\n🔴 Arquivos críticos (testes rasos + complexidade >10):");
        shallowCore.forEach(m => {
            const info = ctx.map[m.file];
            if (info.complexity > 10) {
                console.log(`- ${m.file}`);
                console.log(`  Complexidade: ${info.complexity}`);
                console.log(`  Component Type: ${info.component_type}`);
                console.log(`  Funções: ${(info.functions || []).length}`);
                console.log();
            }
        });
        
    } catch (error) {
        console.error("\n❌ Erro:", error);
        console.error(error.stack);
    }
}

main();