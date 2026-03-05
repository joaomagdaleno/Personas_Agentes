import * as fs from 'fs';
import * as path from 'path';

export function extractPersonaMetadata(file: string, content: string, stack: string, category: string): any {
    const fileName = file.replace(/\.(py|ts)$/, '');
    return {
        id: `${stack}_${category}_${fileName}`,
        name: extractField(content, 'name') || fileName,
        emoji: extractField(content, 'emoji') || '👤',
        role: extractField(content, 'role') || 'PhD Agent',
        stack: extractField(content, 'stack') || stack,
        category,
        rules: extractRules(content),
        reasonTemplate: extractReasonTemplate(content),
        originalFile: `src_local/agents/${stack}/${category}/${file}`
    };
}

function extractField(content: string, field: string): string | null {
    const regex = new RegExp(`(?:self\\.${field}|this\\.${field})\\s*=\\s*["'](.*?)["']`);
    const m = content.match(regex);
    return m ? m[1] : null;
}

function extractRules(content: string): any[] {
    const pattern = /(?:{'regex':\s*['"](.*?)['"],\s*'issue':\s*['"](.*?)['"],\s*'severity':\s*['"](.*?)['"]}|{ regex:\s*(.*?),\s*issue:\s*['"](.*?)['"],\s*severity:\s*['"](.*?)['"] })/g;
    return Array.from(content.matchAll(pattern))
        .map(processRuleMatch)
        .filter(Boolean);
}

function processRuleMatch(m: RegExpMatchArray): any {
    let regex = m[1] || m[4];
    if (!regex) return null;

    if (regex.startsWith('/') && regex.endsWith('/')) {
        regex = regex.substring(1, regex.length - 1);
    }
    if (!m[4]) {
        regex = regex.replace(/\\\\/g, '\\');
    }
    return { regex, issue: m[2] || m[5], severity: m[3] || m[6] };
}

function extractReasonTemplate(content: string): string | null {
    const m = content.match(/(?:return f"(.*?)"|issue:\s*[`'"](.*?)[`'"])/);
    return m ? (m[1] || m[2]) : null;
}
