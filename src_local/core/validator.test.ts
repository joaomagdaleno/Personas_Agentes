
import { describe, it, expect, beforeEach, mock } from 'bun:test';
import { CoreValidator } from './validator.ts';

describe('CoreValidator', () => {
    let validator: CoreValidator;

    beforeEach(() => {
        validator = new CoreValidator();
    });

    it('should calculate integrity score', () => {
        const context = {
            map: {
                'file1.ts': { brittle: true },
                'file2.ts': { silent_error: true }
            }
        };
        const result = validator.validateSystemIntegrity(context);
        expect(result.score).toBe(85); // 100 - (5 + 10)
    });

    it('should return 100 if no issues', () => {
        const result = validator.validateSystemIntegrity({});
        expect(result.score).toBe(100);
    });
});
