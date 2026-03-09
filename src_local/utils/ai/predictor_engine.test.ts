
import { describe, it, expect, beforeEach, mock } from 'bun:test';
import { PredictorEngine } from './predictor_engine.ts';
import * as fs from 'fs';

describe('PredictorEngine', () => {
    let engine: PredictorEngine;
    const testRoot = './tmp_predictor_test';

    beforeEach(() => {
        engine = new PredictorEngine(testRoot);
        engine.clearCurrentSequence();
    });

    it('should record known events', () => {
        engine.recordEvent('PIPELINE_START');
        expect(engine['currentSequence']).toEqual(['PIPELINE_START']);
    });

    it('should ignore unknown events', () => {
        engine.recordEvent('ALIEN_INVASION');
        expect(engine['currentSequence']).toEqual([]);
    });

    it('should evaluate flow anomaly score', () => {
        engine.recordEvent('PIPELINE_START');
        engine.recordEvent('DISCOVERY_PHASE_START');
        const score = engine.evaluateCurrentFlow();
        expect(score).toBeGreaterThanOrEqual(0);
    });

    it('should learn sequences', () => {
        engine.recordEvent('PIPELINE_START');
        engine.recordEvent('DISCOVERY_PHASE_START');
        engine.recordEvent('PIPELINE_FINISHED');

        const initialHistorySize = engine['trainingHistory'].length;
        engine.learnCurrentSequence();
        expect(engine['trainingHistory'].length).toBe(initialHistorySize + 1);
    });

    it('should get sanity metrics', () => {
        const metrics = engine.getSanityMetrics();
        expect(metrics).toHaveProperty('score');
        expect(metrics).toHaveProperty('status');
        expect(metrics).toHaveProperty('label');
    });
});
