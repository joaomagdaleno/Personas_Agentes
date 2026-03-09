
import { describe, it, expect } from 'bun:test';
import { LanguagePersonaOrchestrator } from './language_persona_orchestrator.ts';

describe('LanguagePersonaOrchestrator core logic', () => {
    const orchestrator = new LanguagePersonaOrchestrator();

    it('should detect stacks correctly from context map', () => {
        const contextMap = {
            'main.dart': {},
            'controller.kt': {},
            'script.py': {},
            'config.ts': {}
        };
        const detection = orchestrator.detectStacks(contextMap);
        expect(detection.stacks).toContain('flutter');
        expect(detection.stacks).toContain('kotlin');
        expect(detection.stacks).toContain('python');
        expect(detection.fileCount.flutter).toBe(1);
    });

    it('should return agents for specific stacks', () => {
        const flutterAgents = orchestrator.getAgentsForStack('flutter');
        expect(flutterAgents.length).toBeGreaterThan(0);
        expect(flutterAgents[0]?.stack).toBe('Flutter');

        const pythonAgents = orchestrator.getAgentsForStack('python');
        expect(pythonAgents.length).toBeGreaterThan(0);
        expect(pythonAgents[0]?.stack).toBe('Python');
    });

    it('should summarize findings correctly', () => {
        const findings = [
            { severity: 'critical', stack: 'flutter', agent: 'Bolt' },
            { severity: 'high', stack: 'python', agent: 'Probe' }
        ] as any[];
        const summary = orchestrator.summarize(findings);
        expect(summary.total).toBe(2);
        expect(summary.criticalCount).toBe(1);
        expect(summary.byStack.flutter).toBe(1);
    });
});
