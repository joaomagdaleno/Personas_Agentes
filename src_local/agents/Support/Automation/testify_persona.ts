import { BaseActivePersona } from "../../base.ts";
import type { AuditRule, StrategicFinding } from "../../base.ts";;
import { TestRunner } from "./test_runner";;
import { QualityAnalyst } from "./../Diagnostics/quality_analyst";;
import { PyramidAnalyst } from "./../Analysis/pyramid_analyst";;
import winston from "winston";

/**
 * Core: PhD in Software Verification & Reliability Strategy 🧪
 */
export class TestifyPersona extends BaseActivePersona {
    private runner: TestRunner;
    private analyst: QualityAnalyst;
    private pyramidAnalyst: PyramidAnalyst;

    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Testify";
        this.emoji = "🧪";
        this.role = "PhD QA Strategist";
        this.stack = "Correction"; // Or specific stack if needed
        this.runner = new TestRunner();
        this.analyst = new QualityAnalyst();
        this.pyramidAnalyst = new PyramidAnalyst();
    }

    getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: ['.py', '.ts', '.tsx'],
            rules: [
                { regex: /def test_.*:\s+pass/, issue: 'Vazio: Teste sem asserções.', severity: 'critical' },
                { regex: /hypothesis/, issue: 'Avançado: Teste de Propriedade detectado.', severity: 'low' }
            ]
        };
    }

    async runTestSuite(): Promise<any> {
        return await this.runner.runUnittestDiscover(this.projectRoot || ".");
    }

    async analyzeTestQualityMatrix(mapData: any): Promise<any> {
        return this.analyst.calculateConfidenceMatrix(mapData);
    }

    async analyzeTestPyramid(mapData: any): Promise<any> {
        return await this.pyramidAnalyst.analyze(mapData, this.readProjectFile.bind(this));
    }

    reasonAboutObjective(objective: string, file: string, content: string | Promise<string | null>): StrategicFinding | string | null {
        if (typeof content !== 'string') return null;
        if (file.endsWith('.py') || file.endsWith('.ts')) {
            if (!content.includes('test') && !content.includes('spec')) {
                return {
                    file: file,
                    issue: `Exposição de Risco: O objetivo '${objective}' exige confiança. O módulo '${file}' é Matéria Escura.`,
                    severity: "HIGH",
                    context: "Untested module"
                };
            }
        }
        return null;
    }

    getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, estrategista de QA. Sua missão é garantir a pirâmide de testes 70/20/10.`;
    }
}
