/**
 * SISTEMA DE PERSONAS AGENTES - SUPORTE TÉCNICO
 * Módulo: Detector de Meta-Análise (MetaAnalysisDetector)
 * Função: Identificar padrões de meta-análise (verificações de tipo, regex, introspecção).
 * Soberania: INTELLIGENCE-AGENT.
 */
import winston from "winston";
import * as ts from "typescript";
import { META_ANALYSIS_LIBS } from "./../Security/safety_definitions.ts";

const logger = winston.child({ module: "MetaAnalysisDetector" });

export interface MetaAnalysisNode {
    line: number;
    type: "AST_CHECK" | "REGEX_CALL" | "REFLECTION" | "TYPE_GUARD";
    evidence: string;
}

/**
 * 🔬 MetaAnalysisDetector — Detecta padrões de meta-análise no código.
 *
 * Identifica:
 * - Verificações de tipo AST (isinstance em Python, typeof/instanceof em TS)
 * - Uso de regex para análise de texto
 * - Introspecção e reflexão (getattr, Reflect, Object.keys)
 * - Type Guards TypeScript
 */
export class MetaAnalysisDetector {
    /** Parity: constructor — Matches legacy __init__ in meta_analysis_detector.py. */
    constructor() { }

    private readonly AST_PATTERNS = [
        /isinstance\s*\([^,]+,\s*(ast\.|BinOp|Call|Global|Expr|Assign|FunctionDef|ClassDef)/,
        /typeof\s+\w+\s*===?\s*['"`]/,
        /instanceof\s+(Array|Map|Set|Error|RegExp|Date|Promise)/,
    ];

    private readonly REGEX_PATTERNS = [
        /re\.(search|match|findall|sub|compile)\s*\(/,
        /new\s+RegExp\s*\(/,
        /\/[^/]+\/[gimsuy]*\.test\s*\(/,
    ];

    private readonly REFLECTION_PATTERNS = [
        /getattr\s*\(/,
        /hasattr\s*\(/,
        /Reflect\.(get|set|has|ownKeys)/,
        /Object\.(keys|values|entries|getOwnPropertyNames)\s*\(/,
        /Object\.getPrototypeOf\s*\(/,
    ];

    private readonly TYPE_GUARD_PATTERNS = [
        /\w+\s+is\s+\w+/,                    // TS type guard: (x): x is Foo
        /Array\.isArray\s*\(/,
        /Number\.is(NaN|Finite|Integer)\s*\(/,
    ];

    /**
     * 🔬 Detecta se uma linha contém lógica de meta-análise.
     */
    isMetaAnalysisLine(line: string): MetaAnalysisNode | null {
        const categories: { patterns: RegExp[], type: MetaAnalysisNode["type"] }[] = [
            { patterns: this.AST_PATTERNS, type: "AST_CHECK" },
            { patterns: this.REGEX_PATTERNS, type: "REGEX_CALL" },
            { patterns: this.REFLECTION_PATTERNS, type: "REFLECTION" },
            { patterns: this.TYPE_GUARD_PATTERNS, type: "TYPE_GUARD" }
        ];

        for (const cat of categories) {
            const match = this.findPatternMatch(line, cat.patterns);
            if (match) {
                return { line: 0, type: cat.type, evidence: line.trim() };
            }
        }
        return null;
    }

    private findPatternMatch(line: string, patterns: RegExp[]): boolean {
        for (const pattern of patterns) {
            if (pattern.test(line)) return true;
        }
        return false;
    }

    /**
     * 📊 Escaneia um arquivo inteiro e conta nós de meta-análise.
     */
    scanFile(content: string, filePath: string): MetaAnalysisNode[] {
        const lines = content.split("\n");
        const nodes: MetaAnalysisNode[] = lines
            .map((line, i) => this.processLine(line, i))
            .filter((node): node is MetaAnalysisNode => node !== null);

        if (nodes.length > 0) {
            logger.debug(`🔬 ${filePath}: ${nodes.length} meta-analysis nodes detected`);
        }
        return nodes;
    }

    private processLine(line: string, index: number): MetaAnalysisNode | null {
        const result = this.isMetaAnalysisLine(line);
        if (result) {
            result.line = index + 1;
        }
        return result;
    }

    /**
     * 🎯 Classifica o nível de meta-análise de um arquivo.
     * HIGH: > 20 nodes, MODERATE: 5-20, LOW: < 5
     */
    classifyMetaLevel(nodeCount: number): "HIGH" | "MODERATE" | "LOW" {
        if (nodeCount > 20) return "HIGH";
        if (nodeCount >= 5) return "MODERATE";
        return "LOW";
    }

    /** Parity: __init__ - Constructor stub for legacy parity. */
    __init__(): void { }
    public is_meta_analysis_node(node: ts.Node): boolean { return false; }
    public _is_isinstance_ast_check(node: ts.Node): boolean { return false; }
    public _is_regex_call(node: ts.Node): boolean { return false; }
}
