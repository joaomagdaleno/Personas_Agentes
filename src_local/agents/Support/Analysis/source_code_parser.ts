import winston from "winston";

const logger = winston.child({ module: "SourceCodeParser" });

/**
 * 🔍 Analisador de Código Fonte PhD (Bun Version).
 */
export class SourceCodeParser {
    analyzePy(content: string) {
        try {
            // Regex-based heuristics for speed in TypeScript
            const functions = [...content.matchAll(/def\s+(\w+)\s*\(/g)].map(m => m[1]);
            const classes = [...content.matchAll(/class\s+(\w+)\s*[:\(]/g)].map(m => m[1]);

            return {
                functions,
                classes,
                tree: true // Placeholder for AST tree
            };
        } catch (e) {
            return { functions: [], classes: [], tree: null };
        }
    }

    analyzeKt(content: string) {
        const lines = content.split('\n');
        return {
            imports: lines.filter(l => l.startsWith('import ')).map(l => l.split(/\s+/)[1]),
            functions: [...content.matchAll(/fun\s+(\w+)\s*\(/g)].map(m => m[1]),
            classes: [...content.matchAll(/class\s+(\w+)/g)].map(m => m[1])
        };
    }

    analyzeTs(content: string) {
        const functions = [...content.matchAll(/function\s+(\w+)/g)].map(m => m[1]);
        const arrows = [...content.matchAll(/const\s+(\w+)\s*=\s*(?:async\s*)?(?:\([^)]*\)|[\w]+)\s*=>/g)].map(m => m[1]);
        const methods = [...content.matchAll(/(?:public|private|protected|static|async)\s+(\w+)\s*\(/g)].map(m => m[1]);
        const classes = [...content.matchAll(/class\s+(\w+)/g)].map(m => m[1]);

        return {
            functions: [...new Set([...functions, ...arrows, ...methods])],
            classes: [...new Set(classes)],
            dependencies: this.extractTsImports(content),
            complexity: this.calculateTsComplexity(content),
            tree: true
        };
    }

    calculateTsComplexity(content: string): number {
        const keywords = [/\bif\b/, /\bwhile\b/, /\bfor\b/, /\bcatch\b/, /\bswitch\b/, /\?\.map/, /\?\.forEach/];
        let count = 1;
        for (const kw of keywords) {
            const matches = content.match(new RegExp(kw.source, 'g'));
            if (matches) count += matches.length;
        }
        const boolOps = content.match(/&&|\|\|/g);
        if (boolOps) count += boolOps.length;
        return count;
    }

    extractTsImports(content: string): string[] {
        const imports: string[] = [];
        const matches = content.matchAll(/import\s+(?:\{[^}]*\}|\*\s+as\s+\w+|\w+)\s+from\s+['"]([^'"]+)['"]/g);
        for (const m of matches) {
            if (m[1]) imports.push(m[1]);
        }
        return imports;
    }

    calculatePyComplexity(content: string): number {
        const startComp = Date.now();
        // Heuristic: count control flow keywords
        const keywords = [/\bif\b/, /\bwhile\b/, /\bfor\b/, /\bexcept\b/, /\bwith\b/];
        let count = 1;

        for (const kw of keywords) {
            const matches = content.match(new RegExp(kw.source, 'g'));
            if (matches) count += matches.length;
        }

        // Bool ops
        const boolOps = content.match(/\band\b|\bor\b/g);
        if (boolOps) count += boolOps.length;

        const duration = (Date.now() - startComp) / 1000;
        logger.debug(`⏱️ [SourceParser] Complexidade calculada in ${duration.toFixed(4)}s`);

        return count;
    }

    extractPyImports(content: string): string[] {
        const startImp = Date.now();
        const imports: string[] = [];

        // Direct imports: import os, sys
        const directMatches = content.matchAll(/^import\s+([\w,.\s]+)$/gm);
        for (const m of directMatches) {
            if (m[1]) {
                m[1].split(',').forEach(s => imports.push(s.trim().split('.')[0]!));
            }
        }

        // From imports: from os import path
        const fromMatches = content.matchAll(/^from\s+([\w.]+)\s+import/gm);
        for (const m of fromMatches) {
            if (m[1]) {
                imports.push(m[1].split('.')[0]!);
            }
        }

        const duration = (Date.now() - startImp) / 1000;
        logger.debug(`⏱️ [SourceParser] Extração concluída in ${duration.toFixed(4)}s`);

        return [...new Set(imports)];
    }

    calculateKtComplexity(content: string): number {
        const keywords = ['if ', 'for ', 'while ', 'when ', 'catch ', '?.let', '?.also', '?.run'];
        let count = 1;
        for (const kw of keywords) {
            const matches = content.match(new RegExp(kw.replace('?', '\\?'), 'g'));
            if (matches) count += matches.length;
        }
        return count;
    }
}
