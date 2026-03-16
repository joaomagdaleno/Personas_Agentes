import * as ts from "typescript";

/**
 * 🎓 TestQualityStrategy — PhD in Test Integrity
 * Detecta testes placeholders, fumaça sem valor ou variáveis não declaradas.
 */
export class TestQualityStrategy {
    static audit(node: ts.Node, sourceFile: ts.SourceFile): { isSafe: boolean; reason: string } {
        // Detect 'expect(true).toBe(true)' or 'expect(false).toBe(false)'
        if (ts.isCallExpression(node)) {
            const expression = node.expression;
            if (ts.isPropertyAccessExpression(expression) && expression.name.text === 'toBe') {
                const expectCall = expression.expression;
                if (ts.isCallExpression(expectCall) && ts.isIdentifier(expectCall.expression) && expectCall.expression.text === 'expect') {
                    const arg = expectCall.arguments[0];
                    const toBeArg = node.arguments[0];
                    if (arg && toBeArg && arg.kind === toBeArg.kind &&
                        (arg.kind === ts.SyntaxKind.TrueKeyword || arg.kind === ts.SyntaxKind.FalseKeyword)) {
                        return { isSafe: false, reason: "Placeholder expectation detected: expect(bool).toBe(bool)" };
                    }
                }
            }
        }

        // Detect undefined 'moduleName' usage in templates (heuristic)
        if (ts.isIdentifier(node) && node.text === 'moduleName') {
            // Check if it's declared in the file
            // Simple check: is it in a template literal?
            if (node.parent && ts.isTemplateSpan(node.parent)) {
                // We could check if it exists in scope, but for now, any 'moduleName' in a test file
                // that isn't explicitly defined is likely a bug from the generator.
                return { isSafe: false, reason: "Potential undefined 'moduleName' variable in test template" };
            }
        }

        return { isSafe: true, reason: "" };
    }
}
