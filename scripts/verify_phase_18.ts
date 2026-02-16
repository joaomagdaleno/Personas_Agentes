
import { InfrastructureAssembler } from "../src_local/agents/Support/infrastructure_assembler";
import winston from "winston";

const logger = winston.createLogger({
    level: 'info',
    transports: [new winston.transports.Console()]
});

async function main() {
    console.log("🔍 Verifying Phase 18: Support Agent Restoration...");

    try {
        console.log("1. Testing InfrastructureAssembler.assembleOrchestratorTools()...");
        const tools = InfrastructureAssembler.assembleOrchestratorTools(process.cwd());

        const expectedTools = ["security", "quality", "maturity", "topology"];
        const missing = expectedTools.filter(t => !tools[t]);

        if (missing.length === 0) {
            console.log("✅ New Support Agents Exposed:");
            console.log(`   - Security: ${tools.security.constructor.name}`);
            console.log(`   - Quality: ${tools.quality.constructor.name}`);
            console.log(`   - Maturity: ${tools.maturity.constructor.name}`);
            console.log(`   - Topology: ${tools.topology.constructor.name}`);
        } else {
            console.error(`❌ Missing New Support Agents: ${missing.join(", ")}`);
            process.exit(1);
        }

        console.log("2. Testing MaturityEvaluator Logic...");
        if (tools.maturity.evaluatePersona) {
            console.log("✅ MaturityEvaluator has evaluatePersona method.");
        } else {
            console.error("❌ MaturityEvaluator missing evaluatePersona.");
            process.exit(1);
        }

        console.log("🎉 Phase 18 Verification Complete.");
        process.exit(0);

    } catch (error) {
        console.error("🚨 Verification Failed:", error);
        process.exit(1);
    }
}

main();
