import { TopologyEngine } from "../src_local/utils/topology_engine.ts";
import { writeFileSync } from "fs";

console.log("🗺️ Refreshing Project Map...");
try {
    const map = TopologyEngine.scanProject(".");
    writeFileSync("project_map.json", JSON.stringify(map, null, 2));
    console.log(`✅ project_map.json atualizado com ${map.sovereign.length} arquivos.`);
} catch (e: any) {
    console.error(`❌ Erro ao atualizar mapa: ${e.message}`);
    process.exit(1);
}
