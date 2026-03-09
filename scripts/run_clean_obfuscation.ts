import { HealerPersona } from "../src_local/agents/Support/Core/healer.ts";

async function main() {
    const h = new HealerPersona(".");
    await h.cleanFile("src_local/agents/Support/healer.ts");
}

main().catch(console.error);
