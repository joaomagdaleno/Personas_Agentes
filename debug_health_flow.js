import { Orchestrator } from "./src_local/core/orchestrator";

async function main() {
    const orc = new Orchestrator(".");
    
    try {
        console.log("🔍 Iniciando análise de fluxo de saúde...");
        
        const ctx = await orc.contextEngine.analyzeProject();
        const auditFindings = await orc.runStrategicAudit(ctx, null, true);
        const obfuscationFindings = await orc.runObfuscationScan();
        const allFindings = [...auditFindings, ...obfuscationFindings];
        
        console.log("\n📊 Passo 1: Contexto analisado");
        console.log(`- Arquivos no mapa: ${Object.keys(ctx.map).length}`);
        console.log(`- Alertas de auditoria: ${auditFindings.length}`);
        console.log(`- Alertas de ofuscação: ${obfuscationFindings.length}`);
        console.log(`- Total de alertas: ${allFindings.length}`);
        
        console.log("\n📊 Passo 2: Obtendo QA Data");
        const { QualityAnalyst } = await import("./src_local/agents/Support/Diagnostics/quality_analyst");
        const qa = new QualityAnalyst();
        const qaData = { matrix: qa.calculateConfidenceMatrix(ctx.map) };
        console.log(`- Matriz de confiança: ${qaData.matrix.length} entradas`);
        
        console.log("\n📊 Passo 3: Calculando saúde final");
        const snapshot = await orc.getSystemHealth360(ctx, null, allFindings);
        
        console.log("\n📈 Resultado final:");
        console.log(`- Score: ${snapshot.health_score}%`);
        console.log(`- Status: ${snapshot.status}`);
        console.log("\n📊 Breakdown:");
        Object.entries(snapshot.breakdown).forEach(([key, value]) => {
            console.log(`- ${key}: ${value}`);
        });
        
    } catch (error) {
        console.error("\n❌ Erro:", error);
        console.error(error.stack);
    }
}

main();