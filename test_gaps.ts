import * as fs from 'fs';
import * as path from 'path';
import { extractTSFingerprint } from './src_local/agents/Support/Analysis/parity_utils.ts';

const stacks = ["TypeScript", "Bun", "Flutter", "Go", "Kotlin", "Python"];
const cats = ["Audit", "Content", "Strategic", "System"];
const allResults: any = {};

for (const cat of cats) {
    const tsDir = path.join('src_local', 'agents', 'TypeScript', cat);
    if (!fs.existsSync(tsDir)) continue;
    const agents = fs.readdirSync(tsDir).filter(f => f.endsWith('.ts')).map(f => f.replace('.ts', ''));
    for (const agent of agents) {
        const key = `${cat}/${agent}`;
        allResults[key] = {};
        for (const stack of stacks) {
            const file = path.join('src_local', 'agents', stack, cat, `${agent}.ts`);
            if (fs.existsSync(file)) {
                const content = fs.readFileSync(file, 'utf-8');
                const fp = extractTSFingerprint(content, agent);
                allResults[key][stack] = fp?.rulesCount || 0;
            }
        }
    }
}

// Show divergent
const divergent: any = {};
const symmetric: string[] = [];
for (const [key, counts] of Object.entries(allResults)) {
    const vals = Object.values(counts as any) as number[];
    if (vals.length > 1 && !vals.every(v => v === vals[0])) {
        divergent[key] = counts;
    } else if (vals.length > 1) {
        symmetric.push(key);
    }
}

fs.writeFileSync('ast_parity_matrix.json', JSON.stringify({ divergent, symmetric, divergentCount: Object.keys(divergent).length, symmetricCount: symmetric.length }, null, 2), 'utf8');
console.log(`AST Parity: ${symmetric.length} symmetric, ${Object.keys(divergent).length} divergent`);
