
import * as fs from "node:fs";
import * as path from "node:path";
import { HubManagerGRPC } from "../src_local/core/hub_manager_grpc.ts";
import type { ProjectContext } from "../src_local/core/types.ts";

async function benchmark() {
    console.log("🚀 Starting Persona Fleet Benchmark...");
    
    const hub = new HubManagerGRPC();
    const projectRoot = path.resolve(".");
    const agentsDir = path.join(projectRoot, "src_local/agents/TypeScript");
    
    const context: ProjectContext = {
        identity: { 
            stacks: new Set(["TypeScript"]),
            dna: { version: "1.0.0-benchmark" } 
        },
        map: {
            "test.ts": { 
                content: `
                    console.log('test'); 
                    const x: any = 10; 
                    eval('alert(1)');
                    for (let i in [1,2,3]) {}
                    readFile("test.txt");
                `, 
                component_type: "CODE" 
            }
        },
        hub
    };

    const personas: any[] = [];
    
    // Scan directories for personas
    const categories = ["System", "Audit", "Content", "Strategic"];
    for (const cat of categories) {
        const dir = path.join(agentsDir, cat);
        if (!fs.existsSync(dir)) continue;
        
        const files = fs.readdirSync(dir).filter(f => f.endsWith(".ts") && !f.includes(".test.ts") && !f.includes("Helpers"));
        for (const file of files) {
            try {
                const module = await import(path.join(dir, file));
                const ClassName = Object.keys(module).find(k => k.endsWith("Persona"));
                if (ClassName) {
                    console.log(`   📦 Loaded: ${ClassName}`);
                    personas.push(new module[ClassName](projectRoot));
                }
            } catch (e: any) {
                console.error(`   ❌ Failed to load ${file}: ${e.message}`);
            }
        }
    }

    console.log(`📊 Total personas ready: ${personas.length}`);
    console.log(`🚀 Executing ${personas.length} personas concurrently...`);
    const start = Date.now();
    
    // Add sequential execution option if needed for debugging
    // const results = [];
    // for (const p of personas) {
    //     console.log(`      ⚡ Executing ${p.name}...`);
    //     results.push(await p.execute(context));
    // }

    const results = await Promise.all(personas.map(async p => {
        try {
            return await p.execute(context);
        } catch (e: any) {
            console.error(`      💥 Execution failed for ${p.name}: ${e.message}`);
            return [];
        }
    }));
    
    const end = Date.now();
    console.log(`✅ Benchmark Finished in ${end - start}ms`);
    
    let totalIssues = 0;
    results.forEach((finding, i) => {
        totalIssues += finding.length;
        if (finding.length > 0) {
            console.log(`   [${personas[i].name}] Found: ${finding.length} issues`);
        }
    });
    
    console.log(`\n📈 Total Issues Found Across Fleet: ${totalIssues}`);

    process.exit(0);
}

benchmark().catch(err => {
    console.error("🚨 Benchmark failed:", err);
    process.exit(1);
});
