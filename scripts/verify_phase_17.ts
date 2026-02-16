
import { InfrastructureAssembler } from "../src_local/agents/Support/infrastructure_assembler";
import { MaintenanceEnginePhd } from "../src_local/utils/maintenance_engine_phd";
import winston from "winston";

// Mock Logger
const logger = winston.createLogger({
    level: 'info',
    transports: [new winston.transports.Console()]
});

async function main() {
    console.log("🔍 Verifying Phase 17 Ported Agents...");

    try {
        console.log("1. Testing InfrastructureAssembler.assembleCoreSupport()...");
        const core = InfrastructureAssembler.assembleCoreSupport(process.cwd());
        if (core.auditEngine && core.vetoEngine) {
            console.log("✅ Core Support Assembled.");
        } else {
            console.error("❌ Core Support Missing Components.");
            process.exit(1);
        }

        console.log("2. Testing InfrastructureAssembler.assembleOrchestratorTools()...");
        const tools = InfrastructureAssembler.assembleOrchestratorTools(process.cwd());

        const expectedTools = ["synthesizer", "strategist", "executor", "validator", "refiner", "healer", "architect", "docGen"];
        const missing = expectedTools.filter(t => !tools[t]);

        if (missing.length === 0) {
            console.log("✅ Orchestrator Tools Assembled.");
            console.log(`   - Architect: ${tools.architect.constructor.name}`);
            console.log(`   - DocGen: ${tools.docGen.constructor.name}`);
            console.log(`   - Healer: ${tools.healer.constructor.name}`);
        } else {
            console.error(`❌ Missing Orchestrator Tools: ${missing.join(", ")}`);
            process.exit(1);
        }

        console.log("3. Testing MaintenanceEnginePhd static methods exists...");
        if (typeof MaintenanceEnginePhd.cleanSubmodules === 'function' && typeof MaintenanceEnginePhd.mergeSkillsIndex === 'function') {
            console.log("✅ MaintenanceEnginePhd methods verified.");
        } else {
            console.error("❌ MaintenanceEnginePhd methods missing.");
            process.exit(1);
        }

        console.log("🎉 Phase 17 Verification Complete: All Systems Operational.");
        process.exit(0);

    } catch (error) {
        console.error("🚨 Verification Failed:", error);
        process.exit(1);
    }
}

main();
