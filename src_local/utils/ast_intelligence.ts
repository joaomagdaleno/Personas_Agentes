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
        // 1. Contexto de Teste
        if (sourceFile.fileName.includes("/tests/") || sourceFile.fileName.includes(".test.") || sourceFile.fileName.includes(".spec.")) {
            return true;
        }

        // 2. Dentro de uma chamada de Log
        if (this.isObservabilityContext(node)) return true;

        // 3. Dentro de uma definição técnica (Constantes de Regras, etc)
        if (this.isMetadataContext(node)) return true;

        return false;
    }

    /**
     * Verifica se o nó é parte de uma definição de metadados/regras.
     */
    static isMetadataContext(node: ts.Node): boolean {
        let parent = node.parent;
        while (parent) {
            if (ts.isVariableDeclaration(parent)) {
                const name = parent.name.getText();
                if (/rules|patterns|regex|manifest|metadata/i.test(name)) return true;
            }
            parent = parent.parent;
        }
        return false;
    }

    /**
     * Verifica se o nó está dentro de uma chamada de log/telemetria.
     */
    static isObservabilityContext(node: ts.Node): boolean {
        let parent = node.parent;
        while (parent) {
            if (ts.isCallExpression(parent)) {
                const expression = parent.expression.getText();
                if (/logger|log|console|telemetry/i.test(expression)) return true;
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
}
