import { Orchestrator } from "./src_local/core/orchestrator";

async function main() {
    const orc = new Orchestrator(".");
    
    try {
        console.log("🔍 Iniciando análise de saúde...");
        
        // Carregar contexto do projeto
        const ctx = await orc.contextEngine.analyzeProject();
        console.log(`📊 Arquivos no mapa: ${Object.keys(ctx.map).length}`);
        
        // Verificar se temos alertas
        const auditFindings = await orc.runStrategicAudit(ctx, null, true);
        const obfuscationFindings = await orc.runObfuscationScan();
        const allFindings = [...auditFindings, ...obfuscationFindings];
        
        console.log(`🚨 Alertas encontrados: ${allFindings.length}`);
        
        // Calcular saúde manualmente
        const { ScoreCalculator } = await import("./src_local/agents/Support/Diagnostics/score_calculator");
        const calculator = new ScoreCalculator();
        
        console.log("\n📈 Saúde do sistema:");
        const health = calculator.calculateFinalScore(ctx.map, allFindings);
        console.log(JSON.stringify(health, null, 2));
        
    } catch (error) {
        console.error("❌ Erro:", error);
    }
}

main();