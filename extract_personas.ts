import * as fs from 'fs';
import * as path from 'path';

const baseDir = 'c:/Users/joaom/Documents/GitHub/Personas_Agentes/src_local/agents';
const stacks = ['Python', 'Flutter', 'Kotlin'];
const categories = ['Audit', 'Content', 'Strategic', 'System'];

const manifest: any = { personas: [] };

for (const stack of stacks) {
    for (const category of categories) {
        const dir = path.join(baseDir, stack, category);
        if (!fs.existsSync(dir)) continue;

        const files = fs.readdirSync(dir).filter(f => f.endsWith('.py') && f !== '__init__.py');
        for (const file of files) {
            const content = fs.readFileSync(path.join(dir, file), 'utf-8');

            const nameMatch = content.match(/self\.name\s*=\s*["'](.*?)["']/);
            const emojiMatch = content.match(/self\.emoji\s*=\s*["'](.*?)["']/);
            const roleMatch = content.match(/self\.role\s*=\s*["'](.*?)["']/);
            const stackMatch = content.match(/self\.stack\s*=\s*["'](.*?)["']/);

            // Extract audit rules (simple regex for now)
            const rules: any[] = [];
            const ruleMatches = content.matchAll(/{'regex':\s*['"](.*?)['"],\s*'issue':\s*['"](.*?)['"],\s*'severity':\s*['"](.*?)['"]}/g);
            for (const m of ruleMatches) {
                rules.push({ regex: m[1], issue: m[2], severity: m[3] });
            }

            // Extract reason template
            const reasonMatch = content.match(/return f"(.*?)"/);

            manifest.personas.push({
                id: `${stack}_${category}_${file.replace('.py', '')}`,
                name: nameMatch ? nameMatch[1] : file.replace('.py', ''),
                emoji: emojiMatch ? emojiMatch[1] : '👤',
                role: roleMatch ? roleMatch[1] : 'PhD Agent',
                stack: stackMatch ? stackMatch[1] : stack,
                category: category,
                rules: rules,
                reasonTemplate: reasonMatch ? reasonMatch[1] : null,
                originalFile: `src_local/agents/${stack}/${category}/${file}`
            });
        }
    }
}

fs.writeFileSync('c:/Users/joaom/Documents/GitHub/Personas_Agentes/src_local/utils/persona_manifest.json', JSON.stringify(manifest, null, 2));
console.log(`✅ Extraídos ${manifest.personas.length} personas para o manifesto.`);
