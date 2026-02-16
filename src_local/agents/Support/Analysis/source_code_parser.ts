import winston from "winston";

const logger = winston.child({ module: "SourceCodeParser" });

/**
 * Python analysis results interface
 */
export interface PythonAnalysis {
    functions: string[];
    classes: string[];
    tree: boolean | null;
}

/**
 * Kotlin analysis results interface
 */
export interface KotlinAnalysis {
    imports: string[];
    functions: string[];
    classes: string[];
}

/**
 * TypeScript/JavaScript analysis results interface
 */
export interface TypeScriptAnalysis {
    functions: string[];
    classes: string[];
    dependencies: string[];
    complexity: number;
    tree: boolean;
}

/**
 * 🔍 Analisador de Código Fonte PhD (Bun Version).
 */
export class SourceCodeParser {
    analyzePy(content: string): PythonAnalysis {
        try {
            // Regex-based heuristics for speed in TypeScript
            const functions = [...content.matchAll(/def\s+(\w+)\s*\(/g)].map(m => m[1] || '');
            const classes = [...content.matchAll(/class\s+(\w+)\s*[:\(]/g)].map(m => m[1] || '');

            return {
                functions,
                classes,
                tree: true // Placeholder for AST tree
            };
        } catch (error) {
            logger.error(`❌ [SourceCodeParser] Failed to analyze Python code: ${error}`);
            return { functions: [], classes: [], tree: null };
        }
    }

    analyzeKt(content: string): KotlinAnalysis {
        try {
            const lines = content.split('\n');
            return {
                imports: lines.filter(l => l.startsWith('import ')).map(l => l.split(/\s+/)[1] || ''),
                functions: [...content.matchAll(/fun\s+(\w+)\s*\(/g)].map(m => m[1] || ''),
                classes: [...content.matchAll(/class\s+(\w+)/g)].map(m => m[1] || '')
            };
        } catch (error) {
            logger.error(`❌ [SourceCodeParser] Failed to analyze Kotlin code: ${error}`);
            return { imports: [], functions: [], classes: [] };
        }
    }

    analyzeTs(content: string): TypeScriptAnalysis {
        try {
            const functions = [...content.matchAll(/function\s+(\w+)/g)].map(m => m[1] || '');
            const arrows = [...content.matchAll(/const\s+(\w+)\s*=\s*(?:async\s*)?(?:\([^)]*\)|[\w]+)\s*=>/g)].map(m => m[1] || '');
            const methods = [...content.matchAll(/(?:public|private|protected|static|async)\s+(\w+)\s*\(/g)].map(m => m[1] || '');
            const classes = [...content.matchAll(/class\s+(\w+)/g)].map(m => m[1] || '');
            
            // Extract constructor methods separately
            const constructors = [...content.matchAll(/constructor\s*\(/g)].map(() => 'constructor');

            return {
                functions: [...new Set([...functions, ...arrows, ...methods, ...constructors])],
                classes: [...new Set(classes)],
                dependencies: this.extractTsImports(content),
                complexity: this.calculateTsComplexity(content),
                tree: true
            };
        } catch (error) {
            logger.error(`❌ [SourceCodeParser] Failed to analyze TypeScript code: ${error}`);
            return {
                functions: [],
                classes: [],
                dependencies: [],
                complexity: 1,
                tree: false
            };
        }
    }

    calculateTsComplexity(content: string): number {
        try {
            // Optimized regex for TypeScript complexity calculation
            const complexityPattern = /\b(if|while|for|catch|switch)\b|\?\.(map|forEach)|\&\&|\|\|/g;
            const matches = [...content.matchAll(complexityPattern)];
            return 1 + matches.length;
        } catch (error) {
            logger.error(`❌ [SourceCodeParser] Failed to calculate TypeScript complexity: ${error}`);
            return 1;
        }
    }

    extractTsImports(content: string): string[] {
        try {
            const imports: string[] = [];
            const matches = content.matchAll(/import\s+(?:\{[^}]*\}|\*\s+as\s+\w+|\w+)\s+from\s+['"]([^'"]+)['"]/g);
            for (const m of matches) {
                if (m[1]) imports.push(m[1]);
            }
            return imports;
        } catch (error) {
            logger.error(`❌ [SourceCodeParser] Failed to extract TypeScript imports: ${error}`);
            return [];
        }
    }

    calculatePyComplexity(content: string): number {
        const startComp = Date.now();
        try {
            // Optimized regex for Python complexity calculation
            const complexityPattern = /\b(if|while|for|except|with)\b|\band\b|\bor\b/g;
            const matches = [...content.matchAll(complexityPattern)];
            
            const duration = (Date.now() - startComp) / 1000;
            logger.debug(`⏱️ [SourceParser] Complexidade calculada in ${duration.toFixed(4)}s`);

            return 1 + matches.length;
        } catch (error) {
            logger.error(`❌ [SourceCodeParser] Failed to calculate Python complexity: ${error}`);
            return 1;
        }
    }

    extractPyImports(content: string): string[] {
        const startImp = Date.now();
        try {
            const imports: string[] = [];

            // Process each line separately for better accuracy
            const lines = content.split('\n');
            for (const line of lines) {
                const trimmedLine = line.trim();
                
                // Skip empty lines and comments
                if (!trimmedLine || trimmedLine.startsWith('#')) {
                    continue;
                }

                // Direct imports: import os, sys
                if (trimmedLine.startsWith('import ')) {
                    const importPart = trimmedLine.substring('import '.length);
                    // Remove trailing semicolon
                    const cleanImport = importPart.endsWith(';') ? importPart.slice(0, -1) : importPart;
                    // Split by commas and extract module names
                    cleanImport.split(',').forEach(s => {
                        const module = s.trim().split('.')[0];
                        if (module) {
                            imports.push(module);
                        }
                    });
                }

                // From imports: from os import path
                if (trimmedLine.startsWith('from ')) {
                    const match = trimmedLine.match(/^from\s+([\w.]+)\s+import/);
                    if (match && match[1]) {
                        imports.push(match[1].split('.')[0]);
                    }
                }
            }

            const duration = (Date.now() - startImp) / 1000;
            logger.debug(`⏱️ [SourceParser] Extração concluída in ${duration.toFixed(4)}s`);

            return [...new Set(imports)];
        } catch (error) {
            logger.error(`❌ [SourceCodeParser] Failed to extract Python imports: ${error}`);
            return [];
        }
    }

    calculateKtComplexity(content: string): number {
        try {
            const keywords = ['if ', 'for ', 'while ', 'when ', 'catch ', '?.let', '?.also', '?.run'];
            let count = 1;
            for (const kw of keywords) {
                const matches = content.match(new RegExp(kw.replace('?', '\\?'), 'g'));
                if (matches) count += matches.length;
            }
            return count;
        } catch (error) {
            logger.error(`❌ [SourceCodeParser] Failed to calculate Kotlin complexity: ${error}`);
            return 1;
        }
    }
}
