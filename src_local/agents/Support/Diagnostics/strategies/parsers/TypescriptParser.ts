import * as cp from "child_process";
import * as path from "path";
import * as fs from "fs";
import type { AtomicUnit } from "../DisparityScanner.ts";

export class TypescriptParser {
    private static BINARY_PATH = path.resolve(process.cwd(), "src_native/go-scanner.exe");

    static parse(content: string, filePath: string): AtomicUnit[] {
        if (!fs.existsSync(this.BINARY_PATH)) {
            console.error(`[TypescriptParser] Native scanner not found: ${this.BINARY_PATH}`);
            return [];
        }

        try {
            // Calling native scanner for single file
            const output = cp.execSync(`"${this.BINARY_PATH}" -file "${filePath}" -root "${process.cwd()}"`, { encoding: 'utf8' });
            const data = JSON.parse(output);

            if (data && data.length > 0) {
                return data[0].units.map((u: any) => ({
                    type: u.type as "class" | "function" | "method",
                    name: u.name,
                    parent: u.parent,
                    line: u.line
                }));
            }
            return [];
        } catch (err) {
            console.error(`[TypescriptParser] Native parsing failed for ${filePath}:`, err);
            return [];
        }
    }
}
