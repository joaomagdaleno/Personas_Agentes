import * as ts from "typescript";
import type { AtomicUnit } from "../DisparityScanner.ts";

export class TypescriptParser {
    static parse(content: string, filePath: string): AtomicUnit[] {
        const units: AtomicUnit[] = [];
        const src = ts.createSourceFile(filePath, content, ts.ScriptTarget.Latest, true);

        const visit = (n: ts.Node) => {
            if (ts.isClassDeclaration(n) && n.name) {
                const className = n.name.text;
                units.push({ type: "class", name: className });
                n.members.forEach(m => {
                    if (ts.isMethodDeclaration(m) && m.name && ts.isIdentifier(m.name)) {
                        units.push({ type: "method", name: m.name.text, parent: className });
                    }
                });
            } else if (ts.isFunctionDeclaration(n) && n.name) {
                units.push({ type: "function", name: n.name.text });
            }
            ts.forEachChild(n, visit);
        };

        visit(src);
        return units;
    }
}
