import { Orchestrator } from "./src_local/core/orchestrator";

async function main() {
    const orc = new Orchestrator(".");
    
    try {
        console.log("🔍 Analisando correspondência de testes para ParityAnalyst...");
        
        const ctx = await orc.contextEngine.analyzeProject();
        
        console.log("\n📊 Arquivos do sistema:");
        const parityFiles = Object.keys(ctx.map).filter(file => 
            file.toLowerCase().includes("parity")
        );
        
        console.log("Arquivos contendo 'parity':");
        parityFiles.forEach(file => {
            const info = ctx.map[file];
            console.log(`${file} (${info.component_type})`);
        });
        
        const { QualityAnalyst } = await import("./src_local/agents/Support/Diagnostics/quality_analyst");
        const qa = new QualityAnalyst();
        
        console.log("\n🔍 Procurando teste para parity_analyst:");
        const moduleName = "parity_analyst";
        const testInfo = qa.findTestForModule(moduleName, ctx.map);
        
        if (testInfo) {
            console.log(`✅ Teste encontrado: ${testInfo.file}`);
            console.log(`Assertions: ${testInfo.test_depth?.assertion_count}`);
        } else {
            console.log("❌ Nenhum teste encontrado");
            
            console.log("\n📄 Arquivos de teste disponíveis:");
            const testFiles = Object.entries(ctx.map).filter(([file, info]) => info.component_type === "TEST");
            const parityTestFiles = testFiles.filter(([file]) => file.toLowerCase().includes("parity"));
            
            console.log(`${parityTestFiles.length} arquivos de teste contendo 'parity':`);
            parityTestFiles.forEach(([file, info]) => {
                console.log(`${file} (${info.test_depth?.assertion_count || 0} assertions)`);
            });
        }
        
    } catch (error) {
        console.error("\n❌ Erro:", error);
        console.error(error.stack);
    }
}

main();