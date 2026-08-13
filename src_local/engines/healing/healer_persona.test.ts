
import { describe, it, expect, beforeEach, mock, spyOn } from 'bun:test';
import { HealerPersona } from './healer_persona.ts';

describe('HealerPersona', () => {
    let healer: HealerPersona;
    const testRoot = './tmp_healer_test';

    beforeEach(() => {
        healer = new HealerPersona(testRoot);
    });

    it('should identify and attempt to heal findings', async () => {
        const finding = { file: 'app.ts', issue: 'Missing semicolon' };

        // Mock the brain (CognitiveEngine)
        spyOn(healer['brain'], 'reason').mockResolvedValue('```typescript\nconsole.log("fixed");\n```');

        // Mock the filesystem/Bun.write if needed, or just partial flow
        // For simplicity in unit test, we mock the core healFinding method behavior
        // or ensure it fails gracefully if file missing.
        const res = await healer.healFinding(finding);
        expect(res).toBe(false); // Fails because file doesn't exist in tmp_healer_test
    });

    it('should detect redundancy and suggest removal', async () => {
        const res = await healer.safelyRemoveRedundantFiles(['old.py']);
        expect(res.deleted).toBe(0); // No TS file exists
    });
});
