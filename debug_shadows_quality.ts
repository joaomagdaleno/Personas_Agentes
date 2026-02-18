import { MetricsEngine } from "./src_local/agents/Support/Diagnostics/metrics_engine";
import * as fs from "node:fs";

const metricsEngine = new MetricsEngine();

// Todos os shadows encontrados
const shadowFiles = [
    "src_local/utils/renderer_shadow.ts",
    "src_local/utils/portal_shadow.ts",
    "src_local/utils/merge_shadow.ts",
    "src_local/utils/date_utils_shadow.ts",
    "src_local/dashboard/theme_shadow.ts",
    "src_local/agents/Support/Analysis/debug_shadow.ts",
    "scripts/delete_shadow.ts"
];

console.log("═══════════════════════════════════════════════════════════");
console.log("🔮 VALIDAÇÃO DE SHADOWS - NOVAS MÉTRICAS");
console.log("═══════════════════════════════════════════════════════════\n");

let compliant = 0;
let nonCompliant = 0;

for (const file of shadowFiles) {
    try {
        const content = fs.readFileSync(file, "utf-8");
        const deps: string[] = [];
        
        // Extrair imports
        const importMatches = content.match(/import\s+.*?from\s+['"](.+?)['"]/g);
        if (importMatches) {
            for (const imp of importMatches) {
                const match = imp.match(/from\s+['"](.+?)['"]/);
                if (match) deps.push(match[1]);
            }
        }
        
        const metrics = metricsEngine.analyzeFile(content, file, deps);
        const validation = metricsEngine.validateShadowCompliance(metrics);
        
        console.log(`📄 ${file}`);
        console.log(`   ├─ Complexidade Total: ${metrics.cyclomaticComplexity}`);
        console.log(`   ├─ Complexidade Própria (Self): ${metrics.shadowComplexity}`);
        console.log(`   ├─ LOC: ${metrics.loc} (SLOC: ${metrics.sloc})`);
        console.log(`   ├─ Manutenibilidade: ${metrics.maintainabilityIndex.toFixed(1)}`);
        console.log(`   ├─ Quality Gate: ${metrics.qualityGate}`);
        console.log(`   └─ Status: ${validation.compliant ? "✅ COMPLIANT" : "❌ NON-COMPLIANT"}`);
        
        if (!validation.compliant) {
            console.log(`      Motivo: ${validation.reason}`);
            nonCompliant++;
        } else {
            compliant++;
        }
        console.log("");
    } catch (error) {
        console.error(`❌ Erro ao processar ${file}: ${error}\n`);
    }
}

console.log("═══════════════════════════════════════════════════════════");
console.log(`📊 RESUMO: ${compliant} ✅ | ${nonCompliant} ❌`);
console.log("═══════════════════════════════════════════════════════════");

// Comparação com sistema antigo
console.log("\n═══════════════════════════════════════════════════════════");
console.log("📈 COMPARAÇÃO: Sistema Antigo vs Novo");
console.log("═══════════════════════════════════════════════════════════\n");

const comparison = [
    { name: "portal_shadow.ts", oldCC: 45, oldCov: 0 },
    { name: "renderer_shadow.ts", oldCC: 46, oldCov: 0 },
    { name: "theme_shadow.ts", oldCC: 40, oldCov: 0 },
    { name: "date_utils_shadow.ts", oldCC: 80, oldCov: 0 },
    { name: "debug_shadow.ts", oldCC: 41, oldCov: 0 },
    { name: "merge_shadow.ts", oldCC: 35, oldCov: 0 },
    { name: "delete_shadow.ts", oldCC: 30, oldCov: 0 }
];

for (const c of comparison) {
    try {
        const content = fs.readFileSync(c.name, "utf-8");
        const metrics = metricsEngine.analyzeFile(content, c.name, []);
        
        console.log(`${c.name}:`);
        console.log(`   ANTIGO: CC=${c.oldCC}, Cobertura=${c.oldCov}% → 🔴 FRÁGIL`);
        console.log(`   NOVO:  Self-CC=${metrics.shadowComplexity}, MI=${metrics.maintainabilityIndex.toFixed(1)} → ${metrics.shadowComplexity <= 15 && metrics.maintainabilityIndex >= 20 ? "🟢 PASS" : "🔴 FAIL"}`);
        console.log("");
    } catch (e) {
        // Skip
    }
}
