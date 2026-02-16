import { Orchestrator } from "./src_local/core/orchestrator";

async function main() {
    const orc = new Orchestrator(".");
    
    try {
        console.log("🔍 Iniciando análise de complexidade após refatoração...");
        
        const ctx = await orc.contextEngine.analyzeProject();
        
        // Arquivos refatorados
        const refactoredFiles = [
            "src_local/agents/Support/Analysis/parity_analyst.ts",
            "src_local/agents/Support/Analysis/parity_types.ts",
            "src_local/agents/Support/Analysis/parity_config.ts", 
            "src_local/agents/Support/Analysis/parity_utils.ts"
        ];
        
        console.log("\n📊 Complexidade dos arquivos refatorados:");
        refactoredFiles.forEach(file => {
            const info = ctx.map[file];
            if (info) {
                console.log(`- ${file}: ${info.complexity}`);
                console.log(`  Component Type: ${info.component_type}`);
                console.log(`  Funções: ${(info.functions || []).length}`);
                console.log(`  Test Status: ${info.test_depth?.quality_level}`);
                console.log();
            } else {
                console.log(`- ${file}: Arquivo não encontrado no mapa`);
                console.log();
            }
        });
        
        // Top 10 arquivos com maior complexidade
        console.log("📈 Top 10 arquivos com maior complexidade:");
        Object.entries(ctx.map)
            .sort(([,a], [,b]) => b.complexity - a.complexity)
            .slice(0, 10)
            .forEach(([file, info]) => {
                console.log(`- ${file}: ${info.complexity}`);
            });
        
    } catch (error) {
        console.error("\n❌ Erro:", error);
        console.error(error.stack);
    }
}

main();