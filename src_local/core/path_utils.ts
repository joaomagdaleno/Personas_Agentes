import { join, resolve, dirname, basename, relative } from "node:path";
import { existsSync, statSync } from "node:fs";

/**
 * A lightweight Pathlib-like class for TypeScript.
 */
export class Path {
    private _path: string;

    constructor(path: string) {
        this._path = path ? resolve(path).replace(/^[a-z]:/, (m) => m.toUpperCase()) : path;
    }

    toString(): string {
        return this._path;
    }

    absolute(): Path {
        return new Path(resolve(this._path));
    }

    async exists(): Promise<boolean> {
        return existsSync(this._path);
    }

    async isFile(): Promise<boolean> {
        try {
            return statSync(this._path).isFile();
        } catch {
            return false;
        }
    }

    parent(): Path {
        return new Path(dirname(this._path));
    }

    name(): string {
        return basename(this._path);
    }

    stem(): string {
        const n = this.name();
        const parts = n.split('.');
        if (parts.length > 1) {
            return parts.slice(0, -1).join('.');
        }
        return n;
    }

    basename(): string {
        return basename(this._path);
    }

    relativeTo(other: Path): string {
        const from = resolve(other.toString());
        const to = resolve(this._path);
        if (process.platform === "win32") {
            const fromLower = from.toLowerCase();
            const toLower = to.toLowerCase();
            if (fromLower === toLower) return "";
            if (toLower.startsWith(fromLower)) {
                return to.slice(from.length).replace(/^[\\/]/, "");
            }
        }
        return relative(from, to);
    }

    join(...parts: string[]): Path {
        return new Path(join(this._path, ...parts));
    }
}
