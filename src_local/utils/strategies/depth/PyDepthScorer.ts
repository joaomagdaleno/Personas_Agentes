import { exists, readFile } from "node:fs/promises";

/**
 * 🐍 PyDepthScorer — specialized in Python logic density.
 */
export class PyDepthScorer {
    static async calculate(filePath: string, atomicUnits: any[], getAtomicPoints: (path: string, units: any[]) => number): Promise<number> {
        if (!await exists(filePath)) return 0;
        const content = await readFile(filePath, "utf-8");
        let score = 0;

        const logicKeywords = [" if ", " elif ", " for ", " while ", " def ", " class ", " try ", " except ", " with "];
        logicKeywords.forEach(kw => {
            const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const count = (content.match(new RegExp(escaped, "g")) || []).length;
            score += count * 20;
        });

        const functional = [".match(", "ast.", "re.", "@property", "lambda", "yield"];
        functional.forEach(kw => {
            const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const count = (content.match(new RegExp(escaped, "g")) || []).length;
            score += count * 15;
        });

        score += getAtomicPoints(filePath, atomicUnits);
        return score;
    }
}
