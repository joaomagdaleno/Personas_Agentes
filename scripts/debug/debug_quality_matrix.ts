import { Orchestrator } from "../../src_local/core/orchestrator";

async function main() {
    const orc = new Orchestrator(".");
    
    console.log("🔍 Analisando métricas de qualidade...");
    
    // Rodar análise de contexto
    const ctx = await orc.contextEngine.analyzeProject();
    
    // Importar QualityAnalyst
    const { QualityAnalyst } = await import("./src_local/agents/Support/Diagnostics/quality_analyst");
    const qa = new QualityAnalyst();
    
    // Calcular matriz de confiança com novas métricas
    const matrix = qa.calculateConfidenceMatrix(ctx.map);
    
    console.log(`\n📊 Matriz de qualidade calculada: ${matrix.length} arquivos\n`);
    
    // Verificar métricas avançadas
    let advancedCount = 0;
    let shadowCompliant = 0;
    let shadowNonCompliant = 0;
    let greenGate = 0;
    let redGate = 0;
    
    for (const m of matrix) {
        if (m.advanced_metrics) {
            advancedCount++;
            
            if (m.advanced_metrics.isShadow) {
                if (m.advanced_metrics.shadowCompliance?.compliant) {
                    shadowCompliant++;
                } else {
                    shadowNonCompliant++;
                }
            }
            
            if (m.advanced_metrics.qualityGate === "GREEN") greenGate++;
            if (m.advanced_metrics.qualityGate === "RED") redGate++;
        }
    }
    
    console.log("📈 Estatísticas de Métricas Avançadas:");
    console.log(`   - Arquivos com métricas avançadas: ${advancedCount}`);
    console.log(`   - Shadows compliant: ${shadowCompliant}`);
    console.log(`   - Shadows non-compliant: ${shadowNonCompliant}`);
    console.log(`   - Quality Gate GREEN: ${greenGate}`);
    console.log(`   - Quality Gate RED: ${redGate}`);
    
    // Ver exemplo de metrics
    console.log("\n📋 Exemplo de métricas (primeiro arquivo com advanced_metrics):");
    const withMetrics = matrix.find(m => m.advanced_metrics);
    if (withMetrics) {
        console.log(`   Arquivo: ${withMetrics.file}`);
        console.log(`   Complexidade: ${withMetrics.complexity}`);
        console.log(`   isShadow: ${withMetrics.advanced_metrics.isShadow}`);
        console.log(`   shadowComplexity: ${withMetrics.advanced_metrics.shadowComplexity}`);
        console.log(`   maintainabilityIndex: ${withMetrics.advanced_metrics.maintainabilityIndex}`);
        console.log(`   qualityGate: ${withMetrics.advanced_metrics.qualityGate}`);
    }
    
    // Calcular métricas do projeto
    const projectMetrics = qa.calculateProjectQualityMetrics(matrix);
    console.log("\n📊 Métricas Agregadas do Projeto:");
    console.log(JSON.stringify(projectMetrics, null, 2));
}

main().catch(console.error);
