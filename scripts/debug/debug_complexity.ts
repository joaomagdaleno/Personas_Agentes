import { Orchestrator } from "../../src_local/core/orchestrator";

async function main() {
    const orc = new Orchestrator(".");
    
    try {
        console.log("🔍 Iniciando análise de complexidade...");
        
        const ctx = await orc.contextEngine.analyzeProject();
        
        console.log("\n📊 Arquivos com complexidade > 15:");
        let count = 0;
        
        for (const [file, data] of Object.entries(ctx.map)) {
            if (data.complexity > 15 && !["DOC", "INTERFACE", "TEST"].includes(data.component_type)) {
                console.log(`- ${file}: ${data.complexity}`);
                count++;
            }
        }
        
        console.log(`\nTotal: ${count} arquivos`);
        
    } catch (error) {
        console.error("❌ Erro:", error);
    }
}

main();
