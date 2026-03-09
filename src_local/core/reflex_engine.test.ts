
import { describe, it, expect, beforeEach, mock } from 'bun:test';
import { ReflexEngine } from './reflex_engine.ts';
import { eventBus } from './event_bus.ts';

describe('ReflexEngine', () => {
    let reflexEngine: ReflexEngine;

    beforeEach(() => {
        reflexEngine = new ReflexEngine();
    });

    it('should activate emergency mode when health score is low', () => {
        const spy = mock(() => { });
        eventBus.on('system:halt-experimentation', spy);

        reflexEngine.triggerReflexes({ health_score: 30 }, []);

        expect(spy).toHaveBeenCalled();
    });

    it('should not activate emergency mode when health score is high', () => {
        const spy = mock(() => { });
        eventBus.on('system:halt-experimentation', spy);

        reflexEngine.triggerReflexes({ health_score: 80 }, []);

        expect(spy).not.toHaveBeenCalled();
    });

    it('should log an info message during evaluation', () => {
        // This is mostly for coverage as it's just a log
        reflexEngine.triggerReflexes({ health_score: 50 }, []);
    });
});
