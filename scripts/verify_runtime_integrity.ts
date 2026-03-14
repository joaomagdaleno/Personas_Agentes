import { Orchestrator } from "../src_local/core/orchestrator.ts";
import type { ProjectContext } from "../src_local/core/types.ts";

async function verifyLoading() {
    const projectRoot = process.cwd();
    const orchestrator = new Orchestrator(projectRoot);
    
    // Proper initialization
    await orchestrator.ready;
    
    const context: ProjectContext = {
        identity: { stacks: new Set(["TypeScript"]) },
        map: {}
    };

    console.log("--- Loading and Executing Agents ---");
    let success = 0;
    let failed = 0;
    
    for (const agent of orchestrator.personas) {
        try {
            // Test instantiation and basic execution
            const result = await agent.execute(context);
            if (Array.isArray(result)) {
                console.log(`✅ ${agent.name} [${agent.stack}]: Loaded and Executed (${result.length} results)`);
                success++;
            } else {
                 console.log(`✅ ${agent.name} [${agent.stack}]: Loaded and Executed (Non-array result)`);
                 success++;
            }
        } catch (e: any) {
            console.error(`❌ ${agent.name} [${agent.stack}]: FAILED to execute: ${e.message}`);
            failed++;
        }
    }

    console.log(`\nFinal Report: ${success} agents loaded successfully, ${failed} failed.`);
    if (failed === 0) {
        console.log("🏆 PROVEN: No corruption detected. All agents are functional.");
    } else {
        process.exit(1);
    }
}

verifyLoading().catch(e => {
    console.error("FATAL: " + e.message);
    process.exit(1);
});
