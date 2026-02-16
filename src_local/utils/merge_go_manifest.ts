import fs from 'node:fs';
import path from 'node:path';

const manifestPath = 'c:/Users/joaom/Documents/GitHub/Personas_Agentes/src_local/utils/persona_manifest.json';
const tempPath = 'c:/Users/joaom/Documents/GitHub/Personas_Agentes/src_local/utils/go_manifest_temp.json';

try {
    const mainManifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    const goEntries = JSON.parse(fs.readFileSync(tempPath, 'utf8'));

    // Filter out any existing Go entries to avoid duplicates if re-run
    mainManifest.personas = mainManifest.personas.filter(p => p.stack !== 'Go');

    // Add new Go entries
    mainManifest.personas.push(...goEntries);

    fs.writeFileSync(manifestPath, JSON.stringify(mainManifest, null, 2), 'utf8');
    console.log(`✅ Successfully merged ${goEntries.length} Go personas into manifest.`);
} catch (error) {
    console.error(`❌ Merge failed: ${error.message}`);
    process.exit(1);
}
