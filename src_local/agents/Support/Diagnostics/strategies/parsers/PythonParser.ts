import type { AtomicUnit } from "../DisparityScanner.ts";

export class PythonParser {
    static parse(content: string): AtomicUnit[] {
        const units: AtomicUnit[] = [];
        let curClass: string | null = null;
        let curInd = 0;

        content.split("\n").forEach((line, i) => {
            const cM = line.match(/^(\s*)class\s+(\w+)/);
            const dM = line.match(/^(\s*)def\s+(\w+)/);

            if (cM) {
                curInd = (cM[1] ?? "").length;
                curClass = cM[2] ?? "";
                units.push({ type: "class", name: curClass, line: i + 1 });
            } else if (dM) {
                const ind = (dM[1] ?? "").length;
                const name = dM[2] ?? "";
                if (curClass && ind > curInd) {
                    units.push({ type: "method", name, parent: curClass, line: i + 1 });
                } else {
                    if (curClass && ind <= curInd) curClass = null;
                    units.push({ type: "function", name, line: i + 1 });
                }
            }
        });
        return units;
    }
}
