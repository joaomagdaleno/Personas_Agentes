import * as ts from "typescript";
import { CognitiveEngine } from "../../../utils/cognitive_engine";
import winston from "winston";
import { TopologyEngine } from "../../../utils/topology_engine";
import * as fs from "node:fs";
import * as path from "node:path";

const logger = winston.child({ module: "TestArchitect" });

export class TestArchitectAgent {
    private brain: CognitiveEngine;

    constructor() {
        this.brain = new CognitiveEngine();
    }

    /**
     * Extrai assinaturas do arquivo (funções, classes) para economizar tokens do LLM.
     */
    private extractSignatures(sourceCode: string): any {
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

    /**
     * Analisa o código e desenha um esqueleto de teste unitário.
     */
    async draftTestForFile(filePath: string, sourceCode: string): Promise<string> {
        logger.info(`🏗️ [Architect] Desenhando esqueleto de teste para ${filePath}...`);

        // 1. Otimização: Ler apenas estrutura
        const { classes, functions } = this.extractSignatures(sourceCode);

        if (classes.length === 0 && functions.length === 0) {
            logger.warn(`⚠️ [Architect] Nenhuma classe ou função encontrada em ${filePath}.`);
            return "// Arquivo vazio ou sem exportações testáveis.";
        }

        // 2. Construir Prompt Otimizado
        const jsonContext = JSON.stringify({ file: filePath, structure: { classes, functions } }, null, 2);

        const prompt = `Crie um arquivo de teste unitário Typescript robusto usando 'bun:test' para o seguinte contexto:
${jsonContext}

Requisitos Técnicos:
1. Imports: import { describe, it, expect, mock, beforeEach, spyOn } from "bun:test";
2. Mocks: Identifique dependências implícitas e crie mocks usando 'mock()'.
3. Estrutura: Use 'describe' para a classe/módulo e 'it' para cada método público detectado.
4. Asserções: Use 'expect(...).toBe(...)' e verifique chamadas de mock.

IMPORTANTE: Responda APENAS com o bloco de código TYPECRIPT. Sem explicações ou markdown.`;

        // 3. Raciocínio (LLM)
        try {
            const draft = await this.brain.reason(prompt);
            if (!draft) return "// Falha ao obter resposta do bbrain.";
            return draft.replace(/```typescript/g, "").replace(/```/g, "").trim();
        } catch (error) {
            logger.error(`❌ [Architect] Falha na geração do teste: ${error}`);
            return "// Erro na geração do teste via LLM.";
        }
    }

    /**
     * Identifica arquivos sem testes e gera esqueletos.
     */
    async generateMissingTests(projectRoot: string): Promise<string[]> {
        const topology = TopologyEngine.scanProject(projectRoot);
        const generated: string[] = [];

        const darkMatter = topology.sovereign.filter(f =>
            f.category !== "Script" &&
            f.category !== "Unknown" &&
            !f.name.endsWith(".test.ts") &&
            !f.name.endsWith(".spec.ts")
        );

        for (const file of darkMatter) {
            const testPath = path.join(projectRoot, "tests", `test_${path.basename(file.path, file.extension)}.test.ts`);
            if (!fs.existsSync(testPath)) {
                logger.info(`✨ [Architect] Gerando teste para: ${file.path}`);
                const source = fs.readFileSync(path.join(projectRoot, file.path), "utf-8");
                const skeleton = await this.draftTestForFile(file.path, source);

                if (!fs.existsSync(path.dirname(testPath))) {
                    fs.mkdirSync(path.dirname(testPath), { recursive: true });
                }

                fs.writeFileSync(testPath, skeleton, "utf-8");
                generated.push(testPath);
            }
        }

        return generated;
    }
}
