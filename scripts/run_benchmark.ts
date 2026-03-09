import { TestRunner } from "../src_local/agents/Support/Automation/test_runner.ts";

async function main() {
    const tr = new TestRunner();
    const result = await tr.benchmark(".");
    console.log(JSON.stringify(result, null, 2));
}

main().catch(console.error);
