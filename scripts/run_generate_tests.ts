import { TestArchitectAgent } from "../src_local/agents/Support/Automation/test_architect_agent.ts";

async function main() {
    const ta = new TestArchitectAgent();
    const generated = await ta.generateMissingTests(".");
    console.log(`Generated ${generated.length} tests.`);
}

main().catch(console.error);
