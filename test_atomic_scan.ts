import { GoDiscoveryAdapter } from "./src_local/utils/go_discovery_adapter.ts";
import { configureLogging } from "./src_local/utils/logging_config.ts";

configureLogging("info");
const root = process.cwd();
const results = GoDiscoveryAdapter.scan(root, root);

console.log(`\n🚀 Teste de Scan Atômico (Nível Go)`);
console.log(`Arquivos encontrados: ${results.length}`);

if (results.length > 0) {
    const sample = results[0];
    if (sample) {
        console.log(`\nExemplo: ${sample.path}`);
        console.log(`Unidades Atômicas encontradas: ${sample.units.length}`);
        sample.units.slice(0, 3).forEach(u => {
            console.log(`  - [${u.type.toUpperCase()}] ${u.name} (Linha ${u.line})`);
        });
    }
}
