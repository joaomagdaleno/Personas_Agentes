import { Orchestrator } from "../../src_local/core/orchestrator";

async function main() {
    const orc = new Orchestrator(".");
    
    try {
        console.log("🔍 Analisando correspondência de testes...");
        
        const ctx = await orc.contextEngine.analyzeProject();
        
        const { QualityAnalyst } = await import("./src_local/agents/Support/Diagnostics/quality_analyst");
        const qa = new QualityAnalyst();
        
        console.log("\n📊 Testes encontrados:");
        const testFiles = Object.entries(ctx.map).filter(([file, info]) => info.component_type === "TEST");
        console.log(`${testFiles.length} arquivos de teste`);
        
        console.log("\n🔍 Test files:");
        testFiles.slice(0, 20).forEach(([file, info]) => {
            console.log(`${file}: ${info.test_depth?.assertion_count || 0} assertions`);
        });
        
        console.log("\n🔍 Exemplo de correspondência:");
        const examples = [
            "src_local/agents/Support/Analysis/parity_analyst.ts",
            "src_local/agents/Support/Analysis/parity_utils.ts", 
            "src_local/core/phd_governance_system.ts",
            "src_local/utils/ast_intelligence.ts"
        ];
        
        examples.forEach(file => {
            const info = ctx.map[file];
            if (info) {
                const moduleName = file.split("/").pop().split(".")[0];
                const testInfo = qa.findTestForModule(moduleName, ctx.map);
                if (testInfo) {
                    console.log(`✅ ${file} -> ${testInfo.file} (${testInfo.test_depth?.assertion_count || 0} assertions)`);
                } else {
                    console.log(`❌ ${file} -> NENHUM TESTE ENCONTRADO`);
                }
            }
        });
        
    } catch (error) {
        console.error("\n❌ Erro:", error);
        console.error(error.stack);
    }
}

main();
