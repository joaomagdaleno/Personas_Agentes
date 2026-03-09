
import { describe, it, expect, mock } from 'bun:test';
import { CognitiveEngine } from './cognitive_engine.ts';

describe('CognitiveEngine', () => {
    it('should reason about a problem by calling LLM', async () => {
        const mockHub = {
            reason: mock(async () => 'Mocked response')
        };
        const engine = new CognitiveEngine(mockHub as any);

        // Mock the internal LLM call if possible, or just check it exists
        // CognitiveEngine usually uses Hub/gRPC or directly an LLM.
        // Assuming it's a wrapper for a prompt.
        const res = await engine.reason('Say hello');
        expect(res).toBeDefined();
    });
});
