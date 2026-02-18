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
 * Go analysis results interface
 */
export interface GoAnalysis {
    functions: string[];
    classes: string[]; // Structs in Go
}

/**
 * Dart/Flutter analysis results interface
 */
export interface DartAnalysis {
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
            const functions = [...content.matchAll(/def\s+(\w+)\s*\(/g)].map(m => m[1] || '');
            const classes = [...content.matchAll(/class\s+(\w+)\s*[:\(]/g)].map(m => m[1] || '');

            return {
                functions,
                classes,
                tree: true
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
                functions: [...content.matchAll(/fun\s+(\w+)/g)].map(m => m[1] || ''),
                classes: [...content.matchAll(/class\s+(\w+)/g)].map(m => m[1] || '')
            };
        } catch (error) {
            logger.error(`❌ [SourceCodeParser] Failed to analyze Kotlin code: ${error}`);
            return { imports: [], functions: [], classes: [] };
        }
    }

    analyzeGo(content: string): GoAnalysis {
        try {
            const functions = [...content.matchAll(/func\s+(?:\([^)]+\)\s+)?(\w+)\s*\(/g)].map(m => m[1] || '');
            const structs = [...content.matchAll(/type\s+(\w+)\s+struct/g)].map(m => m[1] || '');
            return { functions, classes: structs };
        } catch (error) {
            logger.error(`❌ [SourceCodeParser] Failed to analyze Go code: ${error}`);
            return { functions: [], classes: [] };
        }
    }

    analyzeDart(content: string): DartAnalysis {
        try {
            const classes = [...content.matchAll(/class\s+(\w+)/g)].map(m => m[1] || '');
            const functions = [...content.matchAll(/(\w+)\s+\w+\s*\(.*?\)\s*{/g)].map(m => {
                const parts = m[0].split(/\s+/);
                return (parts[1] || "").replace('(', '');
            }).filter(f => f !== "");
            return { functions: functions.filter(f => f && f !== 'if' && f !== 'for'), classes };
        } catch (error) {
            logger.error(`❌ [SourceCodeParser] Failed to analyze Dart code: ${error}`);
            return { functions: [], classes: [] };
        }
    }

    analyzeTs(content: string): TypeScriptAnalysis {
        try {
            const functions = [...content.matchAll(/function\s+(\w+)/g)].map(m => m[1] || '');
            const arrows = [...content.matchAll(/const\s+(\w+)\s*=\s*(?:async\s*)?(?:\([^)]*\)|[\w]+)\s*=>/g)].map(m => m[1] || '');
            const methods = [...content.matchAll(/(?:(public|private|protected|static|async)\s+)?(\w+)\s*\(/g)].map(m => m[2] || '');
            const classes = [...content.matchAll(/class\s+(\w+)/g)].map(m => m[1] || '');
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
            // 1. Branching Complexity (Cyclomatic approximation)
            const branchingPattern = /\b(if|while|for|catch|switch)\b|\?\.(map|forEach)|\&\&|\|\|/g;
            const branchingMatches = [...content.matchAll(branchingPattern)];

            // 2. Data Density Complexity (Accounting for constants, exports, and metadata)
            // We give 0.2 points for each export/assignment to recognize "knowledge density"
            const dataPattern = /\b(export|const|let|var)\s+\w+\b|[:=]\s*[\[\{]/g;
            const dataMatches = [...content.matchAll(dataPattern)];

            return Math.ceil(1 + branchingMatches.length + (dataMatches.length * 0.2));
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
        try {
            const complexityPattern = /\b(if|while|for|except|with)\b|\band\b|\bor\b/g;
            const matches = [...content.matchAll(complexityPattern)];
            return 1 + matches.length;
        } catch (error) {
            logger.error(`❌ [SourceCodeParser] Failed to calculate Python complexity: ${error}`);
            return 1;
        }
    }

    extractPyImports(content: string): string[] {
        try {
            const imports: string[] = [];
            const lines = content.split('\n');
            for (const line of lines) {
                const trimmedLine = line.trim();
                if (!trimmedLine || trimmedLine.startsWith('#')) continue;

                if (trimmedLine.startsWith('import ')) {
                    const importPart = trimmedLine.substring('import '.length);
                    const cleanImport = importPart.endsWith(';') ? importPart.slice(0, -1) : importPart;
                    cleanImport.split(',').forEach(s => {
                        const module = s.trim().split('.')[0];
                        if (module) imports.push(module);
                    });
                }
                if (trimmedLine.startsWith('from ')) {
                    const match = trimmedLine.match(/^from\s+([\w.]+)\s+import/);
                    const modName = match?.[1]?.split('.')[0];
                    if (modName) imports.push(modName);
                }
            }
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
                const safeKw = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                const matches = content.match(new RegExp(safeKw, 'g'));
                if (matches) count += matches.length;
            }
            return count;
        } catch (error) {
            logger.error(`❌ [SourceCodeParser] Failed to calculate Kotlin complexity: ${error}`);
            return 1;
        }
    }
}
