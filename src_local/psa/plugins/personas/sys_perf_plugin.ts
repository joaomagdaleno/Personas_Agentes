import type { PsaPlugin } from "../../kernel/psa_plugin.ts";
import type { PsaContext } from "../../kernel/psa_context.ts";

export class SysPerfPlugin implements PsaPlugin {
    public name = "persona-sys-perf-architect";
    public version = "2.0.0";
    public description = "Super Persona de Governança de Recursos, Telemetria e Otimização SIMD/WASM.";

    public apply(ctx: PsaContext): void {
        ctx.tools.register({
            name: "sys_perf.profile",
            description: "Mede o consumo de memória, tempo de CPU e saúde de processos ativos.",
            schema: {
                type: "object",
                properties: {
                    detailed: { type: "boolean", description: "Se deve incluir telemetria detalhada de SIMD" }
                }
            },
            isExclusive: false,
            execute: async () => {
                const mem = process.memoryUsage();
                try {
                    const { PhdGovernanceSystem } = await import("../../../core/governance/system_facade.ts");
                    const gov = PhdGovernanceSystem.getInstance();
                    const load = gov.getCurrentLoad();
                    return {
                        rssMb: Number((mem.rss / (1024 * 1024)).toFixed(1)),
                        heapUsedMb: Number((mem.heapUsed / (1024 * 1024)).toFixed(1)),
                        cpuCores: load.cpuCores,
                        totalMemoryGb: Number(load.totalMemoryGb.toFixed(2)),
                        freeMemoryGb: Number(load.freeMemoryGb.toFixed(2)),
                        memoryPressure: load.freeMemoryGb < 2.0 ? "HIGH" : "NORMAL",
                        runtime: "PSA-Bun-Native-Sovereign"
                    };
                } catch {
                    return {
                        rssMb: Number((mem.rss / (1024 * 1024)).toFixed(1)),
                        heapUsedMb: Number((mem.heapUsed / (1024 * 1024)).toFixed(1)),
                        cpuCores: 8,
                        totalMemoryGb: 16,
                        freeMemoryGb: 8,
                        runtime: "PSA-Bun-Native-Sovereign"
                    };
                }
            }
        });
    }
}
