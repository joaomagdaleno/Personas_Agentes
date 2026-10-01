import { describe, it, expect } from 'bun:test';
import * as fs from 'node:fs';
import * as path from 'node:path';

// Rewritten 2026-10-01. This was an auto-generated "Parity Healer" blind-spot stub
// whose cases could never fail: one asserted a constant tautology, and the
// import check swallowed every error. It now verifies the module really exists and
// really imports, and fails if either stops being true.
describe("parity_types.ts Parity Check", () => {
    const modulePath = path.resolve(__dirname, "../../../src_local/engines/analysis/parity_types.ts");

    it('should exist on disk', () => {
        expect(fs.existsSync(modulePath)).toBe(true);
    });

    it('should be importable', async () => {
        // Type-only module: every export is an interface/type, so TypeScript erases
        // them all at runtime and the namespace is legitimately empty. The real
        // guarantee is that it loads without throwing and that the declarations
        // still exist - the latter is enforced by `bun run typecheck`.
        const module = await import("../../../src_local/engines/analysis/parity_types.ts");
        expect(module).toBeDefined();
    });
});
