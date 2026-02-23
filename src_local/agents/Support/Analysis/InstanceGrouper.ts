import * as fs from "node:fs";
import * as path from "node:path";
import { extractPythonFingerprint, extractTSFingerprint, capitalize } from "./parity_utils";

/**
 * 📂 InstanceGrouper — Helper for grouping agent instances across stacks.
 */
export class InstanceGrouper {
    static group(tsRoot: string): Map<string, any[]> {
        const groups = new Map<string, any[]>();
        const stacks = ["Bun", "Flutter", "Go", "Kotlin", "Python", "TypeScript"];
        const cats = ["Audit", "Content", "Strategic", "System"];

        stacks.forEach(stack => {
            cats.forEach(cat => {
                const dir = path.join(tsRoot, stack, cat);
                if (fs.existsSync(dir)) {
                    this.scanDir(dir, stack, cat, groups);
                }
            });
        });
        return groups;
    }

    private static scanDir(dir: string, stack: string, cat: string, groups: Map<string, any[]>) {
        fs.readdirSync(dir)
            .filter(f => /\.(ts|tsx|go|kt|py|dart)$/.test(f))
            .forEach(tf => {
                const name = tf.replace(/\.(ts|tsx|go|kt|py|dart)$/, "").toLowerCase();
                const content = fs.readFileSync(path.join(dir, tf), "utf-8");
                const fp = tf.endsWith(".py")
                    ? extractPythonFingerprint(content, capitalize(name))
                    : extractTSFingerprint(content, capitalize(name));

                if (fp) {
                    const list = groups.get(name) || [];
                    list.push({ stack, cat, fp, path: path.join(dir, tf) });
                    groups.set(name, list);
                }
            });
    }
}
