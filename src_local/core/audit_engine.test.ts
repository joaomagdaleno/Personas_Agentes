
import { describe, it, expect, beforeEach } from 'bun:test';
import { AuditEngine } from './audit_engine.ts';
import { Path } from './path_utils.ts';

describe('AuditEngine core logic', () => {
    let auditEngine: AuditEngine;
    let mockOrc: any;

    beforeEach(() => {
        mockOrc = {
            projectRoot: new Path(process.cwd()),
            personas: [],
            cacheManager: { update: () => { }, save: () => { }, getFileHash: async () => 'abc', isChanged: () => true },
            executor: { runParallel: async (fn: any, items: any[]) => await Promise.all(items.map(fn)), runCommand: async () => ({ stdout: '' }) },
            stabilityLedger: { update: () => { } }
        };
        auditEngine = new AuditEngine(mockOrc);
    });

    it('should detect changes in project files', async () => {
        const mapFiles = ['file1.ts', 'file2.ts'];
        const changes = await (auditEngine as any).detectChanges(mapFiles);
        expect(Object.keys(changes)).toContain('file1.ts');
        expect(Object.keys(changes)).toContain('file2.ts');
    });

    it('should scan content for TS findings', async () => {
        const content = 'console.log("test")';
        const findings = await auditEngine.scan_content(content, 'test.ts');
        expect(Array.isArray(findings)).toBe(true);
    });

    it('should scan content for MD findings', async () => {
        const content = '# Title';
        const findings = await auditEngine.scan_content(content, 'test.md');
        expect(Array.isArray(findings)).toBe(true);
    });

    it('should return empty for unsupported file types', async () => {
        const findings = await auditEngine.scan_content('', 'test.txt');
        expect(findings).toEqual([]);
    });
});
