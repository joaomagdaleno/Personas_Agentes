import type { AtomicUnit } from "../DisparityScanner.ts";

export class PythonParser {
    static parse(content: string): AtomicUnit[] {
        const units: AtomicUnit[] = [];
        let curClass: string | null = null;
        let curInd = 0;

        content.split("\n").forEach((line, i) => {
            const classMatch = line.match(/^(\s*)class\s+(\w+)/);
            const defMatch = line.match(/^(\s*)def\s+(\w+)/);

            if (classMatch) {
                curInd = (classMatch[1] ?? "").length;
                curClass = classMatch[2] ?? "";
                units.push({ type: "class", name: curClass, line: i + 1 });
                return;
            }

            if (defMatch) {
                const ind = (defMatch[1] ?? "").length;
                const name = defMatch[2] ?? "";
                const isMethod = curClass && ind > curInd;

                if (isMethod) {
                    units.push({ type: "method", name, parent: curClass!, line: i + 1 });
                } else {
                    curClass = null;
                    units.push({ type: "function", name, line: i + 1 });
                }
            }
        });
        return units;
    }
}
