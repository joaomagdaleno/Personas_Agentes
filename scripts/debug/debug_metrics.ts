import { Orchestrator } from "../../src_local/core/orchestrator";

async function main() {
    const orc = new Orchestrator(".");
    
    try {
        console.log("🔍 Iniciando análise de métricas...");
        
        const ctx = await orc.contextEngine.analyzeProject();
        
        const { ScoringMetricsEngine } = await import("./src_local/agents/Support/Diagnostics/scoring_metrics_engine");
        const metricsEngine = new ScoringMetricsEngine();
        
        console.log("\n📊 Passo 1: Dados do mapa");
        console.log(`- Total de arquivos: ${Object.keys(ctx.map).length}`);
        
        const coreTypes = ["AGENT", "CORE", "LOGIC", "UTIL"];
        const relevant = Object.entries(ctx.map).filter(([f, i]) =>
            coreTypes.includes(i.component_type) ||
            (i.complexity > 1 && !["DOC", "INTERFACE", "TEST"].includes(i.component_type))
        );
        
        console.log("\n📊 Passo 2: Componentes relevantes (calcStability)");
        console.log(`- Total relevantes: ${relevant.length}`);
        
        coreTypes.forEach(type => {
            const count = relevant.filter(([f, i]) => i.component_type === type).length;
            console.log(`- ${type}: ${count}`);
        });
        
        const packageMarkers = Object.entries(ctx.map).filter(([f, i]) =>
            ["PACKAGE_MARKER", "CONFIG"].includes(i.component_type) && i.complexity <= 1
        );
        
        console.log("\n📊 Passo 3: Package Markers");
        console.log(`- Total markers: ${packageMarkers.length}`);
        
        const covered = relevant.filter(([f, i]) => i.has_test);
        console.log(`\n📊 Passo 4: Componentes com testes`);
        console.log(`- Total covered: ${covered.length}`);
        
        const [stability] = metricsEngine.calcStability(ctx.map);
        const [purity] = metricsEngine.calcPurity(ctx.map, Object.keys(ctx.map).length);
        const [observability] = metricsEngine.calcObservability(ctx.map);
        const [security] = metricsEngine.calcSecurity([]);
        const [excellence] = metricsEngine.calcExcellence(ctx.map, Object.keys(ctx.map).length);
        
        console.log("\n📈 Métricas individuais:");
        console.log(`- Stability: ${stability}`);
        console.log(`- Purity: ${purity}`);
        console.log(`- Observability: ${observability}`);
        console.log(`- Security: ${security}`);
        console.log(`- Excellence: ${excellence}`);
        
    } catch (error) {
        console.error("\n❌ Erro:", error);
        console.error(error.stack);
    }
}

main();
