import { describe, it, expect } from 'bun:test';
import * as fs from 'node:fs';
import * as path from 'node:path';

// Rewritten 2026-10-01. This was an auto-generated "Parity Healer" blind-spot stub
// whose cases could never fail: one asserted a constant tautology, and the
// import check swallowed every error. It now verifies the module really exists and
// really imports, and fails if either stops being true.
describe("activate-phase.ts Parity Check", () => {
    const modulePath = path.resolve(__dirname, "../scripts/activate-phase.ts");

    it('should exist on disk', () => {
        expect(fs.existsSync(modulePath)).toBe(true);
    });

    it('should load without throwing', async () => {
        // CLI entrypoint: it exports nothing, so the check is that importing it
        // succeeds. A throw here would mean the script is broken.
        await expect(import("../scripts/activate-phase.ts")).resolves.toBeDefined();
    });
});
