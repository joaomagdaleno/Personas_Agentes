import { Orchestrator } from "./src_local/core/orchestrator";

async function main() {
    const orc = new Orchestrator(".");
    
    try {
        console.log("🔍 Iniciando análise da matriz QA...");
        
        const ctx = await orc.contextEngine.analyzeProject();
        
        const { QualityAnalyst } = await import("./src_local/agents/Support/Diagnostics/quality_analyst");
        const qa = new QualityAnalyst();
        const qaData = { matrix: qa.calculateConfidenceMatrix(ctx.map) };
        
        console.log(`\n📊 Total de entradas na matriz: ${qaData.matrix.length}`);
        
        // Contagem por status de teste
        const statusCount = {};
        qaData.matrix.forEach(m => {
            statusCount[m.test_status] = (statusCount[m.test_status] || 0) + 1;
        });
        
        console.log("\n📉 Contagem por status:");
        Object.entries(statusCount).forEach(([status, count]) => {
            console.log(`- ${status}: ${count}`);
        });
        
        // Arquivos com testes rasos e component type CORE/LOGIC/AGENT/UTIL
        const coreTypes = ["AGENT", "CORE", "LOGIC", "UTIL"];
        const shallowCore = qaData.matrix.filter(m => {
            const info = ctx.map[m.file];
            return m.test_status === "SHALLOW" && info && coreTypes.includes(info.component_type);
        });
        
        console.log(`\n📈 Arquivos CORE com testes rasos: ${shallowCore.filter(m => ctx.map[m.file].component_type === "CORE").length}`);
        console.log(`📈 Arquivos LOGIC com testes rasos: ${shallowCore.filter(m => ctx.map[m.file].component_type === "LOGIC").length}`);
        console.log(`📈 Arquivos UTIL com testes rasos: ${shallowCore.filter(m => ctx.map[m.file].component_type === "UTIL").length}`);
        
        // Exemplo de arquivos com testes rasos
        console.log("\n📄 Exemplos de arquivos com testes rasos:");
        shallowCore.slice(0, 20).forEach(m => {
            const info = ctx.map[m.file];
            console.log(`- ${m.file} (${info.component_type})`);
        });
        
    } catch (error) {
        console.error("\n❌ Erro:", error);
        console.error(error.stack);
    }
}

main();