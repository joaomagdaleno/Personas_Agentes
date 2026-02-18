import { MetricsEngine } from "./src_local/agents/Support/Diagnostics/metrics_engine";
import * as fs from "node:fs";

const metricsEngine = new MetricsEngine();

// Lista de arquivos para testar (incluindo alguns shadows)
const testFiles = [
    "src_local/utils/portal_shadow.ts",
    "src_local/utils/debug_shadow.ts",
    "src_local/utils/theme_shadow.ts",
    "src_local/utils/date_utils_shadow.ts",
    "src_local/utils/portal_engine.ts",
    "src_local/agents/Support/Diagnostics/scoring_metrics_engine.ts"
];

console.log("═══════════════════════════════════════════════════════════");
console.log("🔬 TESTE DE MÉTRICAS DE QUALIDADE (9+ métricas)");
console.log("═══════════════════════════════════════════════════════════\n");

for (const file of testFiles) {
    try {
        const content = fs.readFileSync(file, "utf-8");
        const deps: string[] = [];
        
        // Extrair imports simples
        const importMatches = content.match(/import\s+.*?from\s+['"](.+?)['"]/g);
        if (importMatches) {
            for (const imp of importMatches) {
                const match = imp.match(/from\s+['"](.+?)['"]/);
                if (match) deps.push(match[1]);
            }
        }
        
        const metrics = metricsEngine.analyzeFile(content, file, deps);
        const report = metricsEngine.generateMetricsReport(metrics, file);
        
        console.log(report);
        console.log("\n");
    } catch (error) {
        console.error(`❌ Erro ao processar ${file}: ${error}`);
    }
}

console.log("═══════════════════════════════════════════════════════════");
console.log("📊 RESUMO: Validação de Shadows");
console.log("═══════════════════════════════════════════════════════════\n");

// Teste específico de shadows
const shadowFiles = [
    "src_local/utils/portal_shadow.ts",
    "src_local/utils/debug_shadow.ts",
    "src_local/utils/theme_shadow.ts"
];

for (const file of shadowFiles) {
    try {
        const content = fs.readFileSync(file, "utf-8");
        const metrics = metricsEngine.analyzeFile(content, file, []);
        
        const validation = metricsEngine.validateShadowCompliance(metrics);
        
        console.log(`🔮 ${file}`);
        console.log(`   Complexidade Total (CC): ${metrics.cyclomaticComplexity}`);
        console.log(`   Complexidade Própria (Shadow): ${metrics.shadowComplexity}`);
        console.log(`   Manutenibilidade: ${metrics.maintainabilityIndex.toFixed(1)}`);
        console.log(`   Quality Gate: ${metrics.qualityGate}`);
        console.log(`   Status: ${validation.compliant ? "✅ COMPLIANT" : "❌ NON-COMPLIANT"}`);
        console.log(`   Motivo: ${validation.reason}`);
        console.log("");
    } catch (error) {
        console.error(`❌ Erro: ${error}`);
    }
}
