import { DatabaseHub } from "../src_local/core/database_hub.ts";
import { UIUXArchitectService } from "../src_local/engines/reporting/ui_ux_architect_service.ts";
import { SecurityCloudGuardianService } from "../src_local/engines/security/security_cloud_guardian_service.ts";
import { ArchitectureTypesService } from "../src_local/engines/analysis/architecture_types_service.ts";
import { SysPerfArchitectService } from "../src_local/engines/maintenance/sys_perf_architect_service.ts";
import { StrategicCognitiveArchitectService } from "../src_local/engines/strategic/strategic_cognitive_architect_service.ts";
import { AuditCodeGuardianService } from "../src_local/engines/diagnostics/audit_code_guardian_service.ts";
import { SyncDevopsArchitectService } from "../src_local/engines/automation/sync_devops_architect_service.ts";
import { ResilienceHealingArchitectService } from "../src_local/engines/healing/resilience_healing_architect_service.ts";

async function benchmark() {
    console.log("==================================================================");
    console.log("       ⏱️  BENCHMARK NATIVO — SUPER PERSONAS & VAULT (SQLITE)      ");
    console.log("==================================================================\n");

    const projectRoot = process.cwd();

    // 1. Benchmark SQLite Vault (I/O & WAL)
    console.log("⚡ 1. TESTE DE PERFORMANCE SQLITE VAULT:");
    const dbHub = DatabaseHub.getInstance(projectRoot);
    const sqlStart = performance.now();
    const iterations = 500;
    
    for (let i = 0; i < iterations; i++) {
        await dbHub.set(`bench_key_${i}`, `bench_val_${i}`);
    }
    const sqlWriteDuration = performance.now() - sqlStart;
    console.log(`   • Escritas simultâneas (${iterations} ops):  ${sqlWriteDuration.toFixed(2)} ms (${(sqlWriteDuration / iterations).toFixed(3)} ms/op)`);

    const readStart = performance.now();
    for (let i = 0; i < iterations; i++) {
        await dbHub.get(`bench_key_${i}`);
    }
    const sqlReadDuration = performance.now() - readStart;
    console.log(`   • Leituras simultâneas (${iterations} ops):  ${sqlReadDuration.toFixed(2)} ms (${(sqlReadDuration / iterations).toFixed(3)} ms/op)\n`);

    // 2. Benchmark Instanciação & Operações das 8 Super Personas
    console.log("⚡ 2. LATÊNCIA DAS 8 SUPER PERSONAS:");
    const engineStart = performance.now();

    const uiux = new UIUXArchitectService();
    const security = new SecurityCloudGuardianService();
    const arch = new ArchitectureTypesService();
    const perf = new SysPerfArchitectService();
    const strategic = new StrategicCognitiveArchitectService();
    const audit = new AuditCodeGuardianService();
    const sync = new SyncDevopsArchitectService();
    const healing = new ResilienceHealingArchitectService();

    const engineInitDuration = performance.now() - engineStart;
    console.log(`   • Inicialização da Frota 8-Super Personas: ${engineInitDuration.toFixed(2)} ms`);

    const healthCheckStart = performance.now();
    await perf.checkHealth();
    console.log(`   • Telemetria & Governança de Hardware:      ${(performance.now() - healthCheckStart).toFixed(2)} ms`);

    console.log("\n==================================================================");
    console.log("✨ BENCHMARK CONCLUÍDO COM SUCESSO!");
    console.log("==================================================================\n");
}

benchmark().catch(err => {
    console.error("🚨 Benchmark falhou:", err);
    process.exit(1);
});
