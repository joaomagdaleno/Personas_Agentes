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
            count += this.countKeywordMatches(content, kw);
        }
        return count;
    }

    private static countKeywordMatches(content: string, kw: string): number {
        const safeKw = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const matches = content.match(new RegExp(safeKw, 'g'));
        return matches ? matches.length : 0;
    }

    static analyzeGo(content: string) {
        const functions = [...content.matchAll(/func\s+(?:\([^)]+\)\s+)?(\w+)\s*\(/g)].map(m => m[1] || '');
        const structs = [...content.matchAll(/type\s+(\w+)\s+struct/g)].map(m => m[1] || '');
        return { functions, classes: structs };
    }

    static analyzeDart(content: string) {
        const classes = [...content.matchAll(/class\s+(\w+)/g)].map(m => m[1] || '');
        const functions = [...content.matchAll(/(\w+)\s+\w+\s*\(.*?\)\s*{/g)]
            .map(this.extractDartFunctionName)
            .filter(this.isValidDartFunctionName);
        return { functions, classes };
    }

    private static extractDartFunctionName(m: RegExpMatchArray): string {
        const parts = m[0].split(/\s+/);
        return (parts[1] || "").replace('(', '');
    }

    private static isValidDartFunctionName(f: string): boolean {
        return f !== "" && f !== 'if' && f !== 'for';
    }
}
