import { Orchestrator } from "./src_local/core/orchestrator";

async function main() {
    const orc = new Orchestrator(".");
    
    console.log("🔍 Debugando Penalty Engine...");
    
    // Rodar análise de contexto
    const ctx = await orc.contextEngine.analyzeProject();
    
    // Importar QualityAnalyst
    const { QualityAnalyst } = await import("./src_local/agents/Support/Diagnostics/quality_analyst");
    const qa = new QualityAnalyst();
    
    // Importar PenaltyEngine
    const { PenaltyEngine } = await import("./src_local/agents/Support/Core/penalty_engine");
    const penaltyEngine = new PenaltyEngine();
    
    // Calcular matriz de confiança com novas métricas
    const matrix = qa.calculateConfidenceMatrix(ctx.map);
    
    const qaData = { matrix };
    
    console.log("\n📊 Calculando penalidades...");
    
    // Ver a contagem de cada tipo de penalidade
    const coreTypes = ["AGENT", "CORE", "LOGIC", "UTIL"];
    
    // 1. Purity Penalty (Complexity Peaks > 15)
    let peakCount = 0;
    let highCCCount = 0;
    for (const item of matrix) {
        const metrics = item.advanced_metrics || {};
        if (metrics.cyclomaticComplexity > 50) highCCCount++;
        if (metrics.maintainabilityIndex < 10 && metrics.maintainabilityIndex > 0) peakCount++;
    }
    
    console.log(`   - Arquivos com CC > 50: ${highCCCount}`);
    console.log(`   - Arquivos com MI < 10: ${peakCount}`);
    
    // 2. Stability Penalty
    const shallowCount = matrix.filter(m => {
        const item = ctx.map[m.file] || {};
        return m.test_status === "SHALLOW" && (
            coreTypes.includes(item.component_type) ||
            (item.complexity > 1 && !["DOC", "INTERFACE", "TEST"].includes(item.component_type))
        );
    }).length;
    
    console.log(`   - Arquivos com teste SHALLOW: ${shallowCount}`);
    
    // 3. Quality Penalty
    let qualityPenalty = 0;
    let redGate = 0;
    let nonCompliantShadows = 0;
    
    for (const item of matrix) {
        const metrics = item.advanced_metrics || {};
        
        if (metrics.qualityGate === "RED") {
            redGate++;
            qualityPenalty += 0.5;
        }
        
        if (metrics.isShadow && metrics.shadowCompliance && !metrics.shadowCompliance.compliant) {
            nonCompliantShadows++;
            qualityPenalty += 2;
        }
    }
    
    console.log(`   - Quality Gate RED: ${redGate}`);
    console.log(`   - Shadows non-compliant: ${nonCompliantShadows}`);
    console.log(`   - Quality Penalty total: ${qualityPenalty}`);
    
    // Calcular penalidade total
    const stabilityPenalty = shallowCount * 5.0;
    const purityPenalty = peakCount * 2.0;
    const highCCPenalty = highCCCount * 3.0;
    
    console.log(`\n📊 Resumo das Penalidades:`);
    console.log(`   - Purity (Complexity > 15): ${peakCount} * 2.0 = ${purityPenalty}`);
    console.log(`   - Purity (High CC > 50): ${highCCCount} * 3.0 = ${highCCPenalty}`);
    console.log(`   - Stability (Shallow tests): ${shallowCount} * 5.0 = ${stabilityPenalty}`);
    console.log(`   - Quality Gate: ${qualityPenalty}`);
    console.log(`   - TOTAL: ${purityPenalty + highCCPenalty + stabilityPenalty + qualityPenalty}`);
}

main().catch(console.error);
