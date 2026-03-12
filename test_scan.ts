
import { Orchestrator } from "./src_local/core/orchestrator.ts";

async function testScan() {
    const root = process.cwd();
    const orchestrator = new Orchestrator(root);
    await orchestrator.ready;
    
    console.log("📡 Testing HubManagerGRPC.scanProject...");
    const files = await orchestrator.hubManager.scanProject(root, root);
    console.log(`✅ Files found: ${files?.length || 0}`);
    if (files && files.length > 0) {
        console.log("Sample file:", JSON.stringify(files[0], null, 2));
    }
    
    process.exit(0);
}

testScan();
