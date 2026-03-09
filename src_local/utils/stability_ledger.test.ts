
import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import { StabilityLedger } from './stability_ledger.ts';
import { join } from 'path';
import { existsSync, rmSync, mkdirSync } from 'fs';

describe('StabilityLedger', () => {
    let ledger: StabilityLedger;
    const testRoot = join(process.cwd(), 'tmp_stability_test');

    beforeEach(() => {
        try {
            if (!existsSync(testRoot)) {
                // mkdirSync(testRoot, { recursive: true });
            }
            ledger = new StabilityLedger(testRoot);
            ledger.ledger = {};
        } catch (e) {
            console.error('Failed to setup StabilityLedger test:', e);
            throw e;
        }
    });

    afterEach(() => {
        if (existsSync(testRoot)) {
            rmSync(testRoot, { recursive: true, force: true });
        }
    });

    it('should update file status as UNSTABLE when it has issues', () => {
        try {
            const results = [{ file: 'error.ts', issue: 'Logic error' }];
            ledger.update(results);

            expect(ledger.ledger['error.ts']).toBeDefined();
            expect(ledger.ledger['error.ts'].status).toBe('UNSTABLE');
            expect(ledger.ledger['error.ts'].occurrences).toBe(1);
        } catch (e) {
            console.error('Test "should update file status as UNSTABLE" failed:', e);
            throw e;
        }
    });

    it('should mark files as HEALED if they no longer have issues', () => {
        // First make it unstable
        ledger.ledger['fixed.ts'] = { status: 'UNSTABLE', occurrences: 1, history: [] };

        // Update with no issues for this file
        ledger.update([]);

        expect(ledger.ledger['fixed.ts'].status).toBe('HEALED');
        expect(ledger.ledger['fixed.ts'].occurrences).toBe(0);
    });

    it('should respect REFERENCE status for gold standard files', () => {
        ledger.ledger['gold.ts'] = { status: 'REFERENCE', history: [] };

        // Even if it has issues, it stays as REFERENCE
        const results = [{ file: 'gold.ts', issue: 'Style' }];
        ledger.update(results);

        expect(ledger.ledger['gold.ts'].status).toBe('REFERENCE');
    });

    it('should clear non-reference entries', () => {
        ledger.ledger['error.ts'] = { status: 'UNSTABLE' };
        ledger.ledger['gold.ts'] = { status: 'REFERENCE' };

        ledger.clear();

        expect(ledger.ledger['error.ts']).toBeUndefined();
        expect(ledger.ledger['gold.ts']).toBeDefined();
    });
});
