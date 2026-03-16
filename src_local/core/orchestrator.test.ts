
import { describe, it, expect, beforeEach, beforeAll, afterAll, mock, spyOn } from 'bun:test';
import * as fs from 'fs';
import { Orchestrator } from './orchestrator.ts';
import { Path } from './path_utils.ts';

describe('Orchestrator core logic', () => {
    let orchestrator: Orchestrator;
    const mockRoot = process.cwd();

    beforeAll(() => {
        if (!fs.existsSync('./tmp_test')) {
            fs.mkdirSync('./tmp_test');
        }
    });

    afterAll(() => {
        if (fs.existsSync('./tmp_test')) {
            try {
                fs.rmSync('./tmp_test', { recursive: true, force: true });
            } catch (e) {
                console.warn("Could not remove ./tmp_test due to file locks (likely SQLite).");
            }
        }
    });

    beforeEach(async () => {
        // Mock native infrastructure to avoid gRPC timeouts during tests
        spyOn(Orchestrator.prototype as any, '_initNativeInfrastructure').mockResolvedValue(undefined);

        orchestrator = new Orchestrator('./tmp_test');
        await orchestrator.ready;
    });

    it('should initialize all core engines', () => {
        expect(orchestrator.cacheManager).toBeDefined();
        expect(orchestrator.executor).toBeDefined();
        expect(orchestrator.contextEngine).toBeDefined();
        expect(orchestrator.auditEngine).toBeDefined();
        expect(orchestrator.testEngine).toBeDefined();
        expect(orchestrator.taskQueue).toBeDefined();
    });

    it('should allow adding personas', () => {
        const mockPersona = { id: 'test-persona', category: 'test', stack: 'Test', execute: async () => { } } as any;
        orchestrator.addPersona(mockPersona);
        expect(orchestrator.personas).toContain(mockPersona);
    });

    it('should set thinking depth on memory engine', () => {
        const spy = mock(() => { });
        (orchestrator.memoryEngine as any).setDepth = spy;
        orchestrator.setThinkingDepth(5);
        expect(spy).toHaveBeenCalledWith(5);
    });

    it('should correctly build audit report queue by severity', () => {
        const findings = [
            { severity: 'LOW' },
            { severity: 'CRITICAL' },
            { severity: 'HIGH' }
        ] as any[];

        const sorted = orchestrator._buildAuditReportQueue(findings);
        expect(sorted.length).toBeGreaterThan(0);
        expect(sorted[0]?.severity).toBe('CRITICAL');
    });
});
