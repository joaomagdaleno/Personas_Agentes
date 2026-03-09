import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { extractPersonaMetadata } from './persona_extractor_utils';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const baseDir = path.join(__dirname, '..', 'src_local/agents');
const stacks = ['Python', 'Flutter', 'Kotlin', 'TypeScript', 'Go'];
const categories = ['Audit', 'Content', 'Strategic', 'System'];

const manifest: any = { personas: [] };

function main() {
    stacks.forEach(processStack);
    saveManifest();
}

function processStack(stack: string) {
    categories.forEach(cat => processCategory(stack, cat));
}

function processCategory(stack: string, category: string) {
    const dir = path.join(baseDir, stack, category);
    if (fs.existsSync(dir)) {
        processCategoryDir(dir, stack, category);
    }
}

function processCategoryDir(dir: string, stack: string, category: string) {
    fs.readdirSync(dir)
        .filter(isAuditableFile)
        .forEach(file => {
            const content = fs.readFileSync(path.join(dir, file), 'utf-8');
            manifest.personas.push(extractPersonaMetadata(file, content, stack, category));
        });
}

function isAuditableFile(f: string): boolean {
    if (f === '__init__.py') return false;
    if (f.endsWith('.test.ts')) return false;
    return f.endsWith('.py') || f.endsWith('.ts');
}

function saveManifest() {
    const outputPath = path.join(__dirname, '..', 'src_local/utils/persona_manifest.json');
    fs.writeFileSync(outputPath, JSON.stringify(manifest, null, 2));
    console.log(`✅ Extraídos ${manifest.personas.length} personas para o manifesto.`);
}

main();
