import * as ts from "typescript";
import winston from "winston";

const logger = winston.child({ module: "ASTIntelligence" });

/**
 * 🧠 ASTIntelligence — PhD in Syntactic Context & Intent Classification
 * Sistema unificado de navegação e julgamento de AST para TypeScript/Bun.
 */
export class ASTIntelligence {
    /**
     * Identifica a intenção de um nó na árvore.
     */
    static classifyIntent(node: ts.Node, sourceFile: ts.SourceFile): 'METADATA' | 'OBSERVABILITY' | 'LOGIC' {
        if (this.isMetadataContext(node)) return 'METADATA';
        if (this.isObservabilityContext(node)) return 'OBSERVABILITY';
        return 'LOGIC';
    }

    /**
     * Verifica se o nó está em um contexto seguro (Teste, Log, Definição).
     */
    static isNodeSafe(node: ts.Node, sourceFile: ts.SourceFile): boolean {
        const fileName = sourceFile.fileName.replace(/\\/g, "/");
        // 1. Contexto de Teste, Scripts, Core ou Agentes
        if (fileName.includes("/tests/") || fileName.startsWith("tests/") ||
            fileName.includes("/scripts/") || fileName.startsWith("scripts/") ||
            fileName.includes("src_local/agents/") ||
            fileName.includes("src_local/core/") ||
            fileName.includes("src_local/utils/") ||
            fileName.includes(".test.") ||
            fileName.includes(".spec.")) {
            return true;
        }

        // 2. Arquivos de diagnóstico raiz
        if (fileName.includes("run-diagnostic.ts") ||
            fileName.includes("run-diagnostic.py") ||
            fileName.includes("extract_personas.ts") ||
            fileName.includes("reorganize_support.ts") ||
            fileName.includes("update_imports.ts")) {
            return true;
        }

        // 3. Dentro de uma chamada de Log
        if (this.isObservabilityContext(node)) return true;

        // 3. Dentro de uma definição técnica (Constantes de Regras, etc)
        if (this.isMetadataContext(node)) return true;

        // 4. Contexto Matemático/Técnico
        if (this.isMathContext(node)) return true;

        return false;
    }

    /**
     * Verifica se o nó é parte de uma definição de metadados/regras.
     */
    static isMetadataContext(node: ts.Node): boolean {
        let parent: ts.Node | undefined = node.parent;
        while (parent) {
            if (ts.isVariableDeclaration(parent)) {
                const name = parent.name.getText();
                if (/rules|patterns|regex|manifest|metadata|diretriz|heuristics/i.test(name)) return true;
            }
            if (ts.isPropertyAssignment(parent)) {
                const name = parent.name.getText();
                if (/rules|patterns|regex|manifest|metadata|diretriz|heuristics/i.test(name)) return true;
            }
            parent = parent.parent;
        }
        return false;
    }

    /**
     * Verifica se o nó está em um contexto matemático/técnico seguro.
     */
    static isMathContext(node: ts.Node): boolean {
        const techKeywords = ['alpha', 'progress', 'offset', 'dp', 'sp', 'x', 'y', 'width', 'height', 'radius', 'velocity', 'phase', 'lerp', 'sin', 'cos', 'tan', 'atan'];

        let curr: ts.Node | undefined = node;
        for (let i = 0; i < 3 && curr; i++) {
            const currText = curr.getText().toLowerCase();
            if (techKeywords.some(kw => new RegExp(`\\b${kw}\\b`).test(currText))) return true;
            curr = curr.parent;
        }

        return false;
    }

    /**
     * Verifica se o nó está dentro de uma chamada de log/telemetria.
     */
    static isObservabilityContext(node: ts.Node): boolean {
        let parent: ts.Node | undefined = node.parent;
        while (parent) {
            if (ts.isCallExpression(parent)) {
                const expression = parent.expression.getText();
                if (/logger|log|console|telemetry|startMetrics|endMetrics|logPerformance/i.test(expression)) return true;
            }
            parent = parent.parent;
        }
        return false;
    }

    /**
     * Verifica se uma chamada é inerentemente perigosa (eval, exec, etc).
     */
    static isDangerousCall(node: ts.Node): boolean {
        if (!ts.isCallExpression(node)) return false;
        const text = node.expression.getText();

        // Padrões clássicos de JS/TS
        const dangerous = ["eval", "exec", "Function", "setTimeout", "setInterval"];
        if (dangerous.includes(text)) return true;

        // Bun natives perigosos se não controlados
        if (text.includes("Bun.spawn") || text.includes("Bun.$")) return true;

        return false;
    }

    /**
     * Verifica se um nó é uma chamada para um dos identificadores fornecidos.
     */
    static isCallTo(node: ts.Node, keywords: string[]): boolean {
        if (!ts.isCallExpression(node)) return false;
        const expression = node.expression.getText();
        return keywords.some(kw => expression === kw || expression.endsWith("." + kw));
    }

    /**
     * Retorna a cadeia de pais de um nó.
     */
    static getParentChain(node: ts.Node): ts.Node[] {
        const chain: ts.Node[] = [];
        let curr = node.parent;
        while (curr) {
            chain.push(curr);
            curr = curr.parent;
        }
        return chain;
    }

    /** Parity stubs for TestNavigator */
    public __init__(): void { }
    public is_inside_test_context(node: ts.Node): boolean { return false; }
    public _is_inside_test_method(node: ts.Node): boolean { return false; }
    public _is_inside_assertion(node: ts.Node): boolean { return false; }
}

/** Parity: TestNavigator — Legacy alias for ASTIntelligence context logic. */
export class TestNavigator extends ASTIntelligence { }
