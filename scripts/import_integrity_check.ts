import * as fs from 'node:fs';
import * as path from 'node:path';

const AGENT_DIR = "c:\\Users\\João Magdaleno\\Documents\\GitHub\\Personas_Agentes\\src_local\\agents\\TypeScript";

async function checkAll() {
    console.log("--- Batch Integrity Check: Imports ---");
    let success = 0;
    let failed = 0;

    const files: string[] = [];
    
    function walk(dir: string) {
        fs.readdirSync(dir).forEach(f => {
            const p = path.join(dir, f);
            if (fs.statSync(p).isDirectory()) walk(p);
            else if (f.endsWith(".ts") && !f.endsWith(".test.ts")) files.push(p);
        });
    }
    
    walk(AGENT_DIR);

    for (const f of files) {
        try {
            // Test if file can be parsed and imported
            await import(f);
            console.log(`✅ ${path.relative(AGENT_DIR, f)}: Integrated successfully.`);
            success++;
        } catch (e: any) {
            console.error(`❌ ${path.relative(AGENT_DIR, f)}: CORRUPTION detected: ${e.message}`);
            failed++;
        }
    }

    console.log(`\nIntegrity Audit Finished: ${success} passed, ${failed} failed.`);
    if (failed > 0) process.exit(1);
}

checkAll().catch(e => {
    console.error("FATAL: " + e.message);
    process.exit(1);
});
