
import { describe, it, expect } from 'bun:test';
import { LogicAuditor } from './logic_auditor.ts';
import * as ts from 'typescript';

describe('LogicAuditor', () => {
    it('should detect anti-patterns in TypeScript source', () => {
        const sourceCode = `
            function bad() {
                try {
                    doSomething();
                } catch (e) {
                    // Empty catch - silent error
                }
            }
        `;
        const sourceFile = ts.createSourceFile('bad_logic.ts', sourceCode, ts.ScriptTarget.Latest, true);
        const issues = LogicAuditor.scanFile(sourceFile);

        if (issues.length === 0) {
            console.log('No issues found in LogicAuditor.scanFile!');
        } else {
            console.log('Issues found:', JSON.stringify(issues, null, 2));
        }

        expect(issues.length).toBeGreaterThan(0);
        expect(issues.some(i => i.issue.toLowerCase().includes('captura') || i.issue.toLowerCase().includes('silenciosa'))).toBe(true);
    });

    it('should validate interaction safety', () => {
        const safeRes = LogicAuditor.isInteractionSafe('console.log("hi")', 'app.ts');
        expect(safeRes.isSafe).toBe(true);

        const unsafeRes = LogicAuditor.isInteractionSafe('eval("rm -rf /")', 'app.ts');
        expect(unsafeRes.isSafe).toBe(false);
    });
});
