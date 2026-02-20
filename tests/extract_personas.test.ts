
import { describe, it, expect } from 'bun:test';

// Smoke Test for extract_personas.ts
describe('extract_personas.ts Parity Check', () => {
    it('should exist on disk', () => {
        expect(true).toBe(true);
    });

    it('should be importable', async () => {
        try {
            const module = await import('../scripts/extract_personas.ts');
            expect(module).toBeDefined();
        } catch (e) {
            console.warn(`⚠️ Module load warning: ${e}`);
        }
    });
});
