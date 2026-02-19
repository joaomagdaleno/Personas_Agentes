export class PolyglotParser {
    static analyzeKt(content: string) {
        const lines = content.split('\n');
        return {
            imports: lines.filter(l => l.startsWith('import ')).map(l => l.split(/\s+/)[1] || ''),
            functions: [...content.matchAll(/fun\s+(\w+)/g)].map(m => m[1] || ''),
            classes: [...content.matchAll(/class\s+(\w+)/g)].map(m => m[1] || '')
        };
    }

    static calculateKtComplexity(content: string): number {
        const keywords = ['if ', 'for ', 'while ', 'when ', 'catch ', '?.let', '?.also', '?.run'];
        let count = 1;
        for (const kw of keywords) {
            const matches = content.match(new RegExp(kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'));
            if (matches) count += matches.length;
        }
        return count;
    }

    static analyzeGo(content: string) {
        const functions = [...content.matchAll(/func\s+(?:\([^)]+\)\s+)?(\w+)\s*\(/g)].map(m => m[1] || '');
        const structs = [...content.matchAll(/type\s+(\w+)\s+struct/g)].map(m => m[1] || '');
        return { functions, classes: structs };
    }

    static analyzeDart(content: string) {
        const classes = [...content.matchAll(/class\s+(\w+)/g)].map(m => m[1] || '');
        const functions = [...content.matchAll(/(\w+)\s+\w+\s*\(.*?\)\s*{/g)].map(m => {
            const parts = m[0].split(/\s+/);
            return (parts[1] || "").replace('(', '');
        }).filter(f => f !== "" && f !== 'if' && f !== 'for');
        return { functions, classes };
    }
}
