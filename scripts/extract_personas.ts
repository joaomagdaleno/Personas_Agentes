import * as fs from 'fs';
import * as path from 'path';

const baseDir = path.join(process.cwd(), 'src_local/agents');
const stacks = ['Python', 'Flutter', 'Kotlin', 'TypeScript', 'Go'];
const categories = ['Audit', 'Content', 'Strategic', 'System'];

const manifest: any = { personas: [] };

for (const stack of stacks) {
    processStack(stack, categories, baseDir, manifest);
}

function processStack(stack: string, categories: string[], baseDir: string, manifest: any) {
    for (const category of categories) {
        const dir = path.join(baseDir, stack, category);
        if (fs.existsSync(dir)) {
            processCategoryDir(dir, stack, category, manifest);
        }
    }
}

function processCategoryDir(dir: string, stack: string, category: string, manifest: any) {
    const files = fs.readdirSync(dir).filter(f => isAuditableFile(f));
    for (const file of files) {
        const content = fs.readFileSync(path.join(dir, file), 'utf-8');
        const persona = extractPersonaMetadata(file, content, stack, category);
        manifest.personas.push(persona);
    }
}

function isAuditableFile(f: string): boolean {
    return (f.endsWith('.py') || f.endsWith('.ts')) && f !== '__init__.py' && !f.endsWith('.test.ts');
}

function extractPersonaMetadata(file: string, content: string, stack: string, category: string): any {
    const id = `${stack}_${category}_${file.replace(/\.(py|ts)$/, '')}`;
    const name = matchValue(content, /(?:self\.name|this\.name)\s*=\s*["'](.*?)["']/) || file.replace(/\.(py|ts)$/, '');

    return {
        id,
        name,
        emoji: matchValue(content, /(?:self\.emoji|this\.emoji)\s*=\s*["'](.*?)["']/) || '👤',
        role: matchValue(content, /(?:self\.role|this\.role)\s*=\s*["'](.*?)["']/) || 'PhD Agent',
        stack: matchValue(content, /(?:self\.stack|this\.stack)\s*=\s*["'](.*?)["']/) || stack,
        category,
        rules: extractRules(content),
        reasonTemplate: extractReasonTemplate(content),
        originalFile: `src_local/agents/${stack}/${category}/${file}`
    };
}

function matchValue(content: string, regex: RegExp): string | null {
    const m = content.match(regex);
    return m ? m[1] : null;
}

function extractRules(content: string): any[] {
    const rules: any[] = [];
    const pattern = /(?:{'regex':\s*['"](.*?)['"],\s*'issue':\s*['"](.*?)['"],\s*'severity':\s*['"](.*?)['"]}|{ regex:\s*(.*?),\s*issue:\s*['"](.*?)['"],\s*severity:\s*['"](.*?)['"] })/g;

    for (const m of content.matchAll(pattern)) {
        const rule = processRuleMatch(m);
        if (rule) rules.push(rule);
    }
    return rules;
}

function processRuleMatch(m: RegExpMatchArray): any {
    let regex = m[1] || m[4];
    const issue = m[2] || m[5];
    const severity = m[3] || m[6];

    if (!regex) return null;

    if (regex.startsWith('/') && regex.endsWith('/')) {
        regex = regex.substring(1, regex.length - 1);
    }
    if (!m[4]) {
        regex = regex.replace(/\\\\/g, '\\');
    }
    return { regex, issue, severity };
}

function extractReasonTemplate(content: string): string | null {
    const m = content.match(/(?:return f"(.*?)"|issue:\s*[`'"](.*?)[`'"])/);
    return m ? (m[1] || m[2]) : null;
}

fs.writeFileSync(path.join(process.cwd(), 'src_local/utils/persona_manifest.json'), JSON.stringify(manifest, null, 2));
console.log(`✅ Extraídos ${manifest.personas.length} personas para o manifesto.`);
