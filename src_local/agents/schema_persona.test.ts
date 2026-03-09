
import { describe, it, expect } from 'bun:test';
import { SchemaPersona } from './schema_persona.ts';

describe('SchemaPersona core logic', () => {
    const mockMetadata = {
        name: 'TestDr',
        emoji: '👨‍🔬',
        role: 'Tester',
        stack: 'TypeScript',
        rules: [
            { regex: 'TODO', issue: 'Todo found', severity: 'LOW' }
        ],
        reasonTemplate: 'Objective: {objective} in {file}'
    };

    it('should generate audit rules from metadata', () => {
        const persona = new SchemaPersona(mockMetadata);
        const { extensions, rules } = persona.getAuditRules();
        expect(extensions).toContain('.ts');
        expect(rules[0]?.issue).toBe('Todo found');
        expect(rules[0]?.regex).toBeInstanceOf(RegExp);
    });

    it('should reason about objective using template', () => {
        const persona = new SchemaPersona(mockMetadata);
        const content = 'Some code with TODO item';
        const result = persona.reasonAboutObjective('TestObj', 'test.ts', content) as any;
        expect(result.issue).toBe('Objective: TestObj in test.ts');
        expect(result.severity).toBe('HIGH');
    });

    it('should provide correct system prompt', () => {
        const persona = new SchemaPersona(mockMetadata);
        expect(persona.getSystemPrompt()).toBe('Você é o Dr. TestDr, Tester especializado em TypeScript.');
    });
});
