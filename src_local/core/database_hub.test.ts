import { describe, it, expect } from "bun:test";
import { DatabaseHub } from "./database_hub.ts";

describe("DatabaseHub Test Suite", () => {
    it("should instantiate DatabaseHub correctly", () => {
        // DatabaseHub has a private constructor; getInstance() is the public entry point.
        const db = DatabaseHub.getInstance(process.cwd());
        expect(db).toBeDefined();
        db.close();
    });
});
