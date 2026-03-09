
import { describe, it, expect, beforeEach, mock } from 'bun:test';
import { ContextEngine } from './context_engine.ts';
import { Path } from '../core/path_utils.ts';

describe('ContextEngine', () => {
    let contextEngine: ContextEngine;
    const mockRoot = process.cwd();

    beforeEach(() => {
        const mockHub = {} as any;
        contextEngine = new ContextEngine(mockRoot, mockHub);

        // Mock sub-engines to avoid complex setup
        contextEngine.dnaProfiler = { discoverIdentity: async () => ({ stacks: new Set(['TypeScript']) }) } as any;
        contextEngine.mappingLogic = {
            processBatch: async () => ({}),
            getInitialInfo: () => ({ component_type: 'CORE', dependencies: [] }),
            metadataCache: {}
        } as any;
        contextEngine.analyst = {
            analyze_file_logic: async () => ({ classes: [], functions: [] }),
            analyze_intent: () => 'Logic',
            integrityGuardian: { detectVulnerabilities: async () => ({ vulnerabilities: [] }) }
        } as any;
        contextEngine.connectivityMapper = {
            calculateBulk: async () => ({}),
            calculateMetrics: () => ({ coupling_score: 0 })
        } as any;
    });

    it('should initialize with correct paths', () => {
        expect(contextEngine.projectRoot.toString()).toBe(mockRoot);
    });

    it('should register files and perform deep analysis', async () => {
        const filePath = new Path(mockRoot).join('test.ts');

        // Mock content reading
        (contextEngine as any).readFileContent = mock(async () => 'interface Test {}');

        await contextEngine.registerFile(filePath);

        expect(contextEngine.map['test.ts']).toBeDefined();
        expect(contextEngine.map['test.ts'].intent).toBe('Logic');
        expect(contextEngine.map['test.ts'].content).toBe('interface Test {}');
    });

    it('should categorize test quality level', async () => {
        const testPath = new Path(mockRoot).join('test.test.ts');
        (contextEngine as any).readFileContent = mock(async () => 'expect(1).toBe(1); expect(2).toBe(2); expect(3).toBe(3); expect(4).toBe(4); expect(5).toBe(5); expect(6).toBe(6);');

        // Mock mapping logic to return TEST type
        (contextEngine.mappingLogic.getInitialInfo as any) = () => ({ component_type: 'TEST' });

        await contextEngine.registerFile(testPath);

        expect(contextEngine.map['test.test.ts'].test_depth.quality_level).toBe('DEEP');
    });
});
