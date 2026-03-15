import { TestRunner } from "./test_runner";
import { QualityAnalyst } from "./../Diagnostics/quality_analyst";
import { PyramidAnalyst } from "./../Analysis/pyramid_analyst";
import winston from "winston";
import * as fs from "fs";
import * as path from "path";
import type { IAgent, ProjectContext, AuditRule, StrategicFinding } from "../../../core/types.ts";

const logger = winston.child({ module: "Testify" });

/**
 * Core: PhD in Software Verification & Reliability Strategy 🧪
 */
export class TestifyPersona implements IAgent {
    public readonly id: string = "testify";
    public readonly role: string = "PhD QA Strategist";
    public readonly stack: string = "TypeScript";
    public readonly name: string = "Testify";
    public readonly emoji: string = "🧪";
    public readonly category: string = "Automation";

    private runner: TestRunner;
    private analyst: QualityAnalyst;
    private pyramidAnalyst: PyramidAnalyst;
    private projectRoot: string;

    constructor(projectRoot?: string) {
        this.projectRoot = projectRoot || process.cwd();
        this.runner = new TestRunner();
        this.analyst = new QualityAnalyst();
        this.pyramidAnalyst = new PyramidAnalyst();
    }

    async execute(context: ProjectContext): Promise<any> {
        return []; // Implement default if needed
    }

    private async readProjectFile(rel: string): Promise<string | null> {
        try {
            const fullPath = path.join(this.projectRoot, rel);
            if (!fs.existsSync(fullPath)) return null;
            return fs.readFileSync(fullPath, "utf-8");
        } catch (e: any) {
            logger.warn(`⚠️ Error reading: ${rel}: ${e.message}`);
            return null;
        }
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

    /**
     * Executes tests for a specific file or set of files.
     */
    async runTests(files: string[]): Promise<any> {
        if (!this.projectRoot) return { success: false, message: "Project root not set." };
        return await this.runner.runSelectiveTests(this.projectRoot, files);
    }

    reasonAboutObjective(objective: string, file: string, content: string | Promise<string | null>): StrategicFinding | string | null {
        if (typeof content !== 'string') return null;
        if (file.endsWith('.py') || file.endsWith('.ts')) {
            if (!content.includes('test') && !content.includes('spec')) {
                return {
                    file: file,
                    issue: `Exposição de Risco: O objetivo '${objective}' exige confiança. O módulo '${file}' é Matéria Escura.`,
                    severity: "HIGH",
                    context: "Untested module",
                    agent: this.id,
                    role: this.role,
                    emoji: this.emoji
                };
            }
        }
        return null;
    }

    getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, estrategista de QA. Sua missão é garantir a pirâmide de testes 70/20/10.`;
    }
}
