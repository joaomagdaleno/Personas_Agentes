import { BaseActivePersona } from "../base_persona";
import { TestRunner } from "./test_runner";
import { QualityAnalyst } from "./quality_analyst";
import { PyramidAnalyst } from "./pyramid_analyst";
import winston from "winston";

/**
 * Core: PhD in Software Verification & Reliability Strategy 🧪
 */
export class TestifyPersona extends BaseActivePersona {
    private runner: TestRunner;
    private analyst: QualityAnalyst;
    private pyramidAnalyst: PyramidAnalyst;

    constructor(projectRoot: string | null = null) {
        super(projectRoot);
        this.name = "Testify";
        this.emoji = "🧪";
        this.role = "PhD QA Strategist";
        this.stack = "Correction"; // Or specific stack if needed
        this.runner = new TestRunner();
        this.analyst = new QualityAnalyst();
        this.pyramidAnalyst = new PyramidAnalyst();
    }

    async performAudit(): Promise<any[]> {
        winston.info(`[${this.name}] Analisando Confiabilidade Estratégica...`);

        const auditRules = [
            { regex: 'def test_.*:\\s+pass', issue: 'Vazio: Teste sem asserções.', severity: 'critical' },
            { regex: "hypothesis", issue: 'Avançado: Teste de Propriedade detectado.', severity: 'low' }
        ];

        // Use logic from base if needed or custom
        return [];
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

    async reasonAboutObjective(objective: string, file: string, content: string): Promise<any | null> {
        if (file.endsWith('.py') || file.endsWith('.ts')) {
            if (!content.includes('test') && !content.includes('spec')) {
                return {
                    file: file,
                    issue: `Exposição de Risco: O objetivo '${objective}' exige confiança. O módulo '${file}' é Matéria Escura.`,
                    severity: "HIGH",
                    persona: this.name
                };
            }
        }
        return null;
    }

    getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, estrategista de QA. Sua missão é garantir a pirâmide de testes 70/20/10.`;
    }
}
