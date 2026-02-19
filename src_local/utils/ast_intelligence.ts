import * as ts from "typescript";
import winston from "winston";
import { ContextValidator } from "./strategies/ContextValidator.ts";

const logger = winston.child({ module: "ASTIntelligence" });

/**
 * 🧠 ASTIntelligence — PhD in Syntactic Context & Intent Classification
 */
export class ASTIntelligence {
    static classifyIntent(node: ts.Node, sourceFile: ts.SourceFile): 'METADATA' | 'OBSERVABILITY' | 'LOGIC' {
        if (this.isMetadataContext(node)) return 'METADATA';
        if (this.isObservabilityContext(node)) return 'OBSERVABILITY';
        return 'LOGIC';
    }

    static logPerformance(label: string, duration: number): void {
        const severity = duration > 5 ? 'warn' : 'debug';
        logger[severity](`[PERF] ${label}: ${duration}ms`);
    }

    static isNodeSafe(node: ts.Node, sourceFile: ts.SourceFile): boolean {
        return ContextValidator.isNodeSafe(node, sourceFile, this.isObservabilityContext.bind(this), this.isMetadataContext.bind(this), this.isMathContext.bind(this));
    }

    private static readonly METADATA_KEYWORDS = /rules|patterns|regex|manifest|metadata|diretriz|heuristics/i;
    private static readonly TECH_KEYWORDS = new Set(['alpha', 'progress', 'offset', 'dp', 'sp', 'x', 'y', 'width', 'height', 'radius', 'velocity', 'phase', 'lerp', 'sin', 'cos', 'tan', 'atan']);
    private static readonly OBSERVABILITY_KEYWORDS = /logger|log|console|telemetry|startMetrics|endMetrics|logPerformance/i;
    private static readonly DANGEROUS_CALLS = new Set(["eval", "exec", "Function", "setTimeout", "setInterval", "Bun.spawn", "Bun.$"]);

    static isMetadataContext(node: ts.Node): boolean {
        let parent: ts.Node | undefined = node.parent;
        while (parent) {
            if ((ts.isVariableDeclaration(parent) || ts.isPropertyAssignment(parent)) && this.METADATA_KEYWORDS.test(parent.name.getText())) return true;
            parent = parent.parent;
        }
        return false;
    }

    static isMathContext(node: ts.Node): boolean {
        let curr: ts.Node | undefined = node;
        const kwArr = Array.from(this.TECH_KEYWORDS);
        for (let i = 0; i < 3 && curr; i++, curr = curr.parent) {
            const text = curr.getText().toLowerCase();
            if (kwArr.some(kw => text.includes(kw) && new RegExp(`\\b${kw}\\b`).test(text))) return true;
        }
        return false;
    }

    static isObservabilityContext(node: ts.Node): boolean {
        let parent: ts.Node | undefined = node.parent;
        while (parent) {
            if (ts.isCallExpression(parent) && this.OBSERVABILITY_KEYWORDS.test(parent.expression.getText())) return true;
            parent = parent.parent;
        }
        return false;
    }

    static isDangerousCall(node: ts.Node): boolean {
        if (!ts.isCallExpression(node)) return false;
        const text = node.expression.getText();
        return this.DANGEROUS_CALLS.has(text) || [...this.DANGEROUS_CALLS].some(dc => text.includes(dc));
    }

    static isCallTo(node: ts.Node, keywords: string[]): boolean {
        if (!ts.isCallExpression(node)) return false;
        const expr = node.expression.getText();
        return keywords.some(kw => expr === kw || expr.endsWith("." + kw));
    }

    static getParentChain(node: ts.Node): ts.Node[] {
        const chain: ts.Node[] = [];
        let curr = node.parent;
        while (curr) { chain.push(curr); curr = curr.parent; }
        return chain;
    }

    constructor() { }
    public is_inside_test_context(node: ts.Node): boolean { return false; }
    public _is_inside_test_method(node: ts.Node): boolean { return false; }
    public _is_inside_assertion(node: ts.Node): boolean { return false; }
}

export class TestNavigator extends ASTIntelligence { }
