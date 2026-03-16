import * as path from "path";
import * as fs from "fs";
import type { AtomicUnit } from "../DisparityScanner.ts";

export class PythonParser {
    static async parse(content: string, filePath: string): Promise<AtomicUnit[]> {
        try {
            // Using HTTP fetch to Hub server instead of spawning a new process
            const url = `http://localhost:8080/scan?file=${encodeURIComponent(filePath)}&root=${encodeURIComponent(process.cwd())}`;
            const res = await fetch(url);
            if (!res.ok) {
                console.error(`[PythonParser] Hub scan request failed for ${filePath}: ${res.statusText}`);
                return [];
            }

            const data = await res.json() as any[];

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
            console.error(`[PythonParser] Native HTTP parsing failed for ${filePath}:`, err);
            return [];
        }
    }
}
