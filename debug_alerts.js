import { Orchestrator } from "./src_local/core/orchestrator";

async function main() {
    const orc = new Orchestrator(".");
    
    try {
        console.log("🔍 Iniciando análise de alertas...");
        
        // Carregar contexto do projeto
        const ctx = await orc.contextEngine.analyzeProject();
        console.log(`📊 Arquivos no mapa: ${Object.keys(ctx.map).length}`);
        
        // Executar auditorias
        const auditFindings = await orc.runStrategicAudit(ctx, null, true);
        const obfuscationFindings = await orc.runObfuscationScan();
        
        console.log(`🚨 Alerta de auditoria: ${auditFindings.length}`);
        console.log(`🔒 Alertas de segurança: ${obfuscationFindings.length}`);
        
        // Filtrar alertas por severidade
        const allFindings = [...auditFindings, ...obfuscationFindings];
        const criticalAlerts = allFindings.filter(f => f.severity === 'critical');
        const highAlerts = allFindings.filter(f => f.severity === 'high');
        const mediumAlerts = allFindings.filter(f => f.severity === 'medium');
        const lowAlerts = allFindings.filter(f => f.severity === 'low');
        
        console.log(`\n📈 Severidade: ${JSON.stringify({
            critical: criticalAlerts.length,
            high: highAlerts.length,
            medium: mediumAlerts.length,
            low: lowAlerts.length
        }, null, 2)}`);
        
        // Mostrar alertas críticos e altos
        console.log("\n🔥 Alertas Críticos:");
        criticalAlerts.forEach(alert => {
            console.log(`- ${alert.issue} (${alert.file})`);
        });
        
        console.log("\n⚠️ Alertas Altos:");
        highAlerts.slice(0, 10).forEach(alert => {
            console.log(`- ${alert.issue} (${alert.file})`);
        });
        
    } catch (error) {
        console.error("❌ Erro:", error);
    }
}

main();