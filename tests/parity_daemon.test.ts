import { describe, it, expect } from "bun:test";
import { ParityDaemon } from "../src_local/core/parity_daemon.ts";

describe("ParityDaemon Test Suite", () => {
    it("should instantiate ParityDaemon with project root", () => {
        const daemon = new ParityDaemon(process.cwd());
        expect(daemon).toBeDefined();
    });
});
