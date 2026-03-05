import * as ts from "typescript";
import * as fs from "fs";

function analyze(filePath: string) {
    const content = fs.readFileSync(filePath, "utf-8");
    const sourceFile = ts.createSourceFile(filePath, content, ts.ScriptTarget.Latest, true);

    const nestableKinds = [
        ts.SyntaxKind.IfStatement,
        ts.SyntaxKind.WhileStatement,
        ts.SyntaxKind.DoStatement,
        ts.SyntaxKind.ForStatement,
        ts.SyntaxKind.ForInStatement,
        ts.SyntaxKind.ForOfStatement,
        ts.SyntaxKind.CatchClause,
        ts.SyntaxKind.SwitchStatement,
        ts.SyntaxKind.ArrowFunction,
        ts.SyntaxKind.FunctionDeclaration,
        ts.SyntaxKind.MethodDeclaration,
        ts.SyntaxKind.ConditionalExpression
    ];

    const results: { name: string, score: number, nesting: number, line: number }[] = [];

    function getMetrics(node: ts.Node, nestingLevel: number): { score: number, maxNesting: number } {
        let score = 0;
        let currentNesting = nestingLevel;
        let maxChildNesting = nestingLevel;

        if (nestableKinds.includes(node.kind)) {
            if (node.kind !== ts.SyntaxKind.ArrowFunction &&
                node.kind !== ts.SyntaxKind.FunctionDeclaration &&
                node.kind !== ts.SyntaxKind.MethodDeclaration) {
                score = 1 + nestingLevel;
            }
            currentNesting++;
            maxChildNesting = currentNesting;
        }

        ts.forEachChild(node, (child) => {
            const childMetrics = getMetrics(child, currentNesting);
            score += childMetrics.score;
            if (childMetrics.maxNesting > maxChildNesting) {
                maxChildNesting = childMetrics.maxNesting;
            }
        });

        return { score, maxNesting: maxChildNesting };
    }

    function walk(node: ts.Node) {
        if (ts.isFunctionDeclaration(node) || ts.isMethodDeclaration(node) || ts.isArrowFunction(node)) {
            let name = "anonymous";
            if (ts.isFunctionDeclaration(node) || ts.isMethodDeclaration(node)) {
                name = node.name?.getText() || "anonymous";
            } else if (ts.isVariableDeclaration(node.parent) && node.parent.name) {
                name = node.parent.name.getText();
            }

            const metrics = getMetrics(node, 0);
            const { line } = sourceFile.getLineAndCharacterOfPosition(node.getStart());
            results.push({ name, score: metrics.score, nesting: metrics.maxNesting, line: line + 1 });
        }
        ts.forEachChild(node, walk);
    }

    walk(sourceFile);

    console.log(`Complexity breakdown for ${filePath}:`);
    results.sort((a, b) => b.score - a.score).forEach(r => {
        console.log(`  Line ${r.line}: ${r.name} - Score: ${r.score}, Nesting: ${r.nesting}`);
    });
}

const file = process.argv[2];
if (file) {
    analyze(file);
} else {
    console.log("Usage: bun run find_complex_funcs.ts <file>");
}
