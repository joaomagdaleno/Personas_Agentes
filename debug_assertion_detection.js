import { Orchestrator } from "./src_local/core/orchestrator";

async function main() {
    const orc = new Orchestrator(".");
    
    try {
        console.log("🔍 Analisando detecção de assertions...");
        
        const ctx = await orc.contextEngine.analyzeProject();
        
        console.log(`\n📊 Arquivos com assertions: ${Object.values(ctx.map).filter(info => info.test_depth?.assertion_count > 0).length}`);
        
        console.log("\n📈 Arquivos com assertions > 0:");
        Object.entries(ctx.map)
            .filter(([file, info]) => info.component_type === "TEST" && info.test_depth?.assertion_count > 0)
            .forEach(([file, info]) => {
                console.log(`${file}: ${info.test_depth.assertion_count} assertions`);
            });
            
        console.log("\n📉 Arquivos de teste com assertions = 0:");
        Object.entries(ctx.map)
            .filter(([file, info]) => info.component_type === "TEST" && (!info.test_depth || info.test_depth.assertion_count === 0))
            .forEach(([file, info]) => {
                console.log(`${file}`);
            });
            
    } catch (error) {
        console.error("\n❌ Erro:", error);
        console.error(error.stack);
    }
}

main();