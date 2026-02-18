import { expect, test, describe } from "bun:test";
import { DELETE_MODE } from "../../scripts/delete_redundant";

describe("Delete Redundant Deep Audit", () => {
    test("should have strict delete mode", () => {
        expect(DELETE_MODE).toBe("STRICT");
    });
});
