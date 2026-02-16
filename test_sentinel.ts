import { SystemSentinel } from "./src_local/utils/system_sentinel.ts";

const sentinel = new SystemSentinel();
console.log("🔍 Testando SystemSentinel com Go...");

const start = Date.now();
const health = sentinel.getSystemHealth();
const end = Date.now();

console.log("Métricas Coletadas:", JSON.stringify(health, null, 2));
console.log(`Tempo de resposta: ${end - start}ms`);

if (health.cpu_usage !== undefined) {
    console.log("✅ Integração Go/TS funcionando!");
} else {
    console.log("❌ Falha na coleta de métricas.");
}
