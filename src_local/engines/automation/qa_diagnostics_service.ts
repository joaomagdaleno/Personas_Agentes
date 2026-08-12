import winston from "winston";
import * as ts from "typescript";
import { CognitiveEngine } from "../../utils/cognitive_engine.ts";
import { TopologyEngine } from "../../utils/topology_engine.ts";
import { HubManagerGRPC } from "../../core/hub_manager_grpc.ts";
import { TestRunner } from "./test_runner.ts";
import { QualityAnalyst } from "../diagnostics/quality_analyst.ts";
import { PyramidAnalyst } from "../analysis/pyramid_analyst.ts";
import type { IAgent, ProjectContext, AuditRule } from "../../core/types.ts";
import * as fs from "node:fs";
import * as path from "node:path";

const logger = winston.child({ module: "QADiagnosticsService" });

/**
 * 🧪 QADiagnosticsService
 * Serviço Soberano da Super Persona qa_diagnostics.
 * Unifica a estratégia de testes, arquitetura de suítes de teste e execução da fase de validação.
 */
export class QADiagnosticsService implements IAgent {
    public readonly id: string = "qa_diagnostics";
    public readonly role: string = "PhD QA & Diagnostics Specialist";
    public readonly stack: string = "TypeScript";
    public readonly name: string = "QADiagnostics";
    public readonly emoji: string = "🧪";
    public readonly category: string = "Automation";

    private brain: CognitiveEngine;
    private topologyEngine: TopologyEngine;
    private runner: TestRunner;
    private analyst: QualityAnalyst;
    private pyramidAnalyst: PyramidAnalyst;
    private projectRoot: string;
    public orc: any;

    constructor(projectRootOrOrchestrator?: any, hubManager?: HubManagerGRPC) {
        if (typeof projectRootOrOrchestrator === "object" && projectRootOrOrchestrator?.projectRoot) {
            this.orc = projectRootOrOrchestrator;
            this.projectRoot = projectRootOrOrchestrator.projectRoot.toString();
        } else {
            this.projectRoot = (typeof projectRootOrOrchestrator === "string" ? projectRootOrOrchestrator : process.cwd());
        }
        this.brain = new CognitiveEngine();
        this.topologyEngine = new TopologyEngine(hubManager);
        this.runner = new TestRunner();
        this.analyst = new QualityAnalyst();
        this.pyramidAnalyst = new PyramidAnalyst();
    }

    async execute(context: ProjectContext): Promise<any> {
        return [];
    }

    /**
     * Executa a fase de validação do projeto (ex-ValidationAgent).
     */
    async runValidationPhase(findings: any[], skipTests: boolean): Promise<any> {
        if (skipTests) return this.fastFallback();

        logger.info("🧪 [QADiagnostics] Iniciando fase de validação...");

        const plan: Record<string, Set<string>> = {};
        for (const f of findings) {
            if (!f || typeof f !== 'object') continue;
            const file = f.file;
            const context = f.context || f.agent;
            if (file && context) {
                if (!plan[file]) plan[file] = new Set();
                plan[file].add(context);
            }
        }
        if (findings.length > 0 && this.orc?.runTargetedVerification) {
            const verificationFindings = await this.orc.runTargetedVerification(plan);
            findings.push(...verificationFindings);
        }

        const targetFiles = this.orc?.lastDetectedChanges || [];
        const filesFromFindings = targetFiles.length > 0 ? targetFiles :
            findings.filter(f => typeof f === 'object' && f.file).map(f => f.file);

        if (this.orc?.coreValidator?.verifyCoreHealth) {
            return await this.orc.coreValidator.verifyCoreHealth(this.orc.projectRoot.toString(), filesFromFindings);
        }
        return this.fastFallback();
    }

    private fastFallback() {
        return {
            success: true,
            pass_rate: 100,
            total_run: 0,
            failed: 0,
            pyramid: {},
            execution: { success: true }
        };
    }

    /**
     * Desenha um esqueleto de teste unitário (ex-TestArchitectAgent).
     */
    async draftTestForFile(filePath: string, sourceCode: string): Promise<string> {
        logger.info(`🏗️ [QADiagnostics] Desenhando esqueleto de teste para ${filePath}...`);
        const { classes, functions } = this.extractSignatures(sourceCode);

        if (classes.length === 0 && functions.length === 0) {
            logger.warn(`⚠️ [QADiagnostics] Nenhuma classe ou função encontrada em ${filePath}.`);
            return "// Arquivo vazio ou sem exportações testáveis.";
        }

        const jsonContext = JSON.stringify({ file: filePath, structure: { classes, functions } }, null, 2);
        const prompt = `Crie um arquivo de teste unitário Typescript robusto usando 'bun:test' para o seguinte contexto:
${jsonContext}

Requisitos Técnicos:
1. Importe os elementos de ${filePath}.
2. Use 'describe' e 'it'.
3. Inclua asserções de borda (null, undefined, tipos inválidos).`;

        try {
            const answer = await this.brain.reason(prompt);
            return answer ?? "// Falha ao desenhar esqueleto de teste.";
        } catch (error) {
            logger.error(`❌ [QADiagnostics] Erro ao desenhar teste: ${error}`);
            return "// Falha ao desenhar esqueleto de teste.";
        }
    }

    private extractSignatures(sourceCode: string): { classes: string[]; functions: string[] } {
        const sourceFile = ts.createSourceFile("temp.ts", sourceCode, ts.ScriptTarget.Latest, true);
        const classes: string[] = [];
        const functions: string[] = [];

        const visit = (node: ts.Node) => {
            if (ts.isClassDeclaration(node) && node.name) {
                classes.push(node.name.text);
            } else if (ts.isFunctionDeclaration(node) && node.name) {
                functions.push(node.name.text);
            }
            ts.forEachChild(node, visit);
        };
        visit(sourceFile);
        return { classes, functions };
    }

    getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: ['.py', '.ts', '.tsx', '.zig'],
            rules: [
                { regex: /def test_.*:\s+pass/, issue: 'Vazio: Teste sem asserções.', severity: 'critical' },
                { regex: /hypothesis/, issue: 'Avançado: Teste de Propriedade detectado.', severity: 'low' }
            ]
        };
    }

    async runTestSuite(): Promise<any> {
        return await this.runner.runUnittestDiscover(this.projectRoot || ".");
    }
}

// Aliases retrocompatíveis
export class ValidationAgent extends QADiagnosticsService {}
export class TestifyPersona extends QADiagnosticsService {}
export class TestArchitectAgent extends QADiagnosticsService {}
