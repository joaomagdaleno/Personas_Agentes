import * as fs from "node:fs";
import * as path from "node:path";

const projectRoot = "c:\\Users\\joaovitormagdaleno\\Documents\\GitHub\\Personas_Agentes";
const registryPath = path.join(projectRoot, "agents_registry.json");
const outputDir = path.join(projectRoot, "agents_registry");

if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
}

try {
    const data = JSON.parse(fs.readFileSync(registryPath, "utf-8"));
    const stacks = data.stacks;

    if (!stacks) throw new Error("Key 'stacks' not found in agents_registry.json");

    for (const [stack, personas] of Object.entries(stacks)) {
        const fileName = `${stack.toLowerCase()}.json`;
        const filePath = path.join(outputDir, fileName);
        fs.writeFileSync(filePath, JSON.stringify(personas, null, 4));
        console.log(`✅ Created ${filePath} (${(personas as any[]).length} personas)`);
    }
} catch (err: any) {
    console.error("❌ Error splitting registry:", err.message || err);
    process.exit(1);
}
