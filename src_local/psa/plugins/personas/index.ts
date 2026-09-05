import type { PsaContext } from "../../kernel/psa_context.ts";
import { StrategicCognitivePlugin } from "./strategic_cognitive_plugin.ts";
import { AuditCodePlugin } from "./audit_code_plugin.ts";
import { SecurityCloudPlugin } from "./security_cloud_plugin.ts";
import { ArchitectureTypesPlugin } from "./architecture_types_plugin.ts";
import { ResilienceHealingPlugin } from "./resilience_healing_plugin.ts";
import { SysPerfPlugin } from "./sys_perf_plugin.ts";
import { SyncDevOpsPlugin } from "./sync_devops_plugin.ts";
import { UIUXArchitectPlugin } from "./ui_ux_architect_plugin.ts";

export {
    StrategicCognitivePlugin,
    AuditCodePlugin,
    SecurityCloudPlugin,
    ArchitectureTypesPlugin,
    ResilienceHealingPlugin,
    SysPerfPlugin,
    SyncDevOpsPlugin,
    UIUXArchitectPlugin
};

/**
 * Monta as 8 Super Personas de Engenharia Soberana como plugins no micro-kernel PsaContext.
 */
export function mountAllSuperPersonaPlugins(ctx: PsaContext): void {
    ctx.use(new StrategicCognitivePlugin());
    ctx.use(new AuditCodePlugin());
    ctx.use(new SecurityCloudPlugin());
    ctx.use(new ArchitectureTypesPlugin());
    ctx.use(new ResilienceHealingPlugin());
    ctx.use(new SysPerfPlugin());
    ctx.use(new SyncDevOpsPlugin());
    ctx.use(new UIUXArchitectPlugin());
}
