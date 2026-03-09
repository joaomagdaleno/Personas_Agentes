import { HealerPersona } from "../src_local/agents/Support/Core/healer_persona.ts";
import { DirectorPersona } from "../src_local/agents/TypeScript/Strategic/director.ts";

async function main() {
    const h = new HealerPersona(".");
    const d = new DirectorPersona(".");

    await d.validatePhDCensus();
    await h.safelyRemoveRedundantFiles([
        "src_local/agents/base.py",
        "missing_python_files.txt",
        "missing_py.txt"
    ]);

    console.log("Migration Finalized.");
}

main().catch(console.error);
