import { describe, it, expect } from "bun:test";
import { DatabaseHub } from "./database_hub.ts";

describe("DatabaseHub Test Suite", () => {
    it("should instantiate DatabaseHub correctly", () => {
        const db = new DatabaseHub(process.cwd());
        expect(db).toBeDefined();
        db.close();
    });
});
