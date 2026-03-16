import winston from 'winston';
import * as fs from 'fs';
import * as path from 'path';
import { Path } from "../../../core/path_utils.ts";
import type { IAgent, ProjectContext } from "../../../core/types.ts";
import { Orchestrator } from "../../../core/orchestrator.ts";
import { DependencyGraph, type DependencyGraphResult } from "../../../utils/dependency_graph.ts";
import { TestAuditor, type TestAuditReport, type TestAuditResult } from "../../../utils/test_auditor.ts";

// ==========================================
// PIRÂMIDE DE TESTES INDUSTRIAL (Google 80/15/5)
// Ref: Martin Fowler (TestPyramid), Mike Cohn (Succeeding with Agile), Google Testing Blog
// ==========================================

export interface PyramidMetrics {
    unitTests: number;
    integrationTests: number;
    e2eTests: number;
    totalSourceFiles: number;
    untestedFiles: number;
    unitPercent: number;
    integrationPercent: number;
    e2ePercent: number;
    pyramidHealthy: boolean;
    auditReport?: TestAuditReport;
}

export interface TestGenerationPlan {
    unitTestsNeeded: number;
    integrationTestsNeeded: number;
    e2eTestsNeeded: number;
    unitTargets: string[];
    integrationTargets: Array<[string, string]>;
    e2eTargets: string[];
    regenerationTargets: TestAuditResult[];
}

const PYRAMID_TARGETS = {
    UNIT_PERCENT: 80,
    INTEGRATION_PERCENT: 15,
    E2E_PERCENT: 5,
};

/**
 * 🧪 Agente QAEngineer (PhD in Software Quality & Test Automation).
 * Implementa a Pirâmide de Testes Industrial (Google 80/15/5).
 */
export class QAEngineerPersona implements IAgent {
    public readonly id: string = "qa_engineer";
    public readonly role: string = "PhD Software QA Engineer";
    public readonly stack: string = "TypeScript/Rust";
    public readonly name: string = "QA Engineer";
    public readonly emoji: string = "🧪";
    public readonly category: string = "Diagnostics";
    private projectRoot: string;

    constructor(projectRoot?: string) {
        this.projectRoot = projectRoot || process.cwd();
    }

    async execute(context: ProjectContext): Promise<any> {
        winston.info("🧪 [QA Engineer] Iniciando ciclo de planejamento de testes PhD...");
        
        const plan = this.planTestsByPyramid("src_local");
        const orc = (context as any).orchestrator as Orchestrator;
        
        if (!orc || !orc.taskQueue) {
            winston.error("❌ [QA Engineer] Orchestrator ou TaskQueue não disponíveis no contexto.");
            return [];
        }

        let tasksCreated = 0;

        // 1. Enfileirar re-gerações (Prioridade Máxima: remover SMOKE tests)
        for (const target of plan.regenerationTargets) {
            const taskType = this.mapLayerToTaskType(target.testFile);
            const success = await orc.taskQueue.enqueue(taskType, target.sourceFile);
            if (success) tasksCreated++;
        }

        // 2. Enfileirar novos Unit Tests
        for (const target of plan.unitTargets) {
            const success = await orc.taskQueue.enqueue("UNIT_TEST_GEN", target);
            if (success) tasksCreated++;
        }

        // 3. Enfileirar Integration Tests
        for (const [fileA, fileB] of plan.integrationTargets) {
            const success = await orc.taskQueue.enqueue("INTEGRATION_TEST_GEN", `${fileA}|${fileB}`);
            if (success) tasksCreated++;
        }

        // 4. Enfileirar E2E Tests
        for (const target of plan.e2eTargets) {
            const success = await orc.taskQueue.enqueue("E2E_TEST_GEN", target);
            if (success) tasksCreated++;
        }

        winston.info(`🧪 [QA Engineer] Ciclo concluído. ${tasksCreated} tarefas de teste agendadas.`);
        return { tasksCreated, plan };
    }

    private mapLayerToTaskType(testFile: string): string {
        if (testFile.endsWith('.e2e.test.ts')) return "E2E_TEST_GEN";
        if (testFile.endsWith('.integration.test.ts')) return "INTEGRATION_TEST_GEN";
        return "UNIT_TEST_GEN";
    }

    getSystemPrompt(): string {
        return "Você é o Dr. Test, um engenheiro de QA PhD focado em testes unitários reais e robustos seguindo a Pirâmide de Testes Industrial (Google 80/15/5). Sua missão é garantir zero bugs via automação de alta fidelidade.";
    }

    // ==========================================
    // PIRÂMIDE: SCANNER & PLANNER
    // ==========================================

    /**
     * Analisa o estado atual dos testes no projeto e retorna métricas da pirâmide.
     */
    scanPyramidMetrics(srcDir: string = "src_local"): PyramidMetrics {
        const rootPath = path.join(this.projectRoot, srcDir);
        const sourceFiles: string[] = [];
        const unitTests: string[] = [];
        const integrationTests: string[] = [];
        const e2eTests: string[] = [];

        this.walkDir(rootPath, (filePath: string) => {
            const name = path.basename(filePath);
            if (!name.endsWith('.ts')) return;

            if (name.endsWith('.e2e.test.ts')) {
                e2eTests.push(filePath);
            } else if (name.endsWith('.integration.test.ts')) {
                integrationTests.push(filePath);
            } else if (name.endsWith('.test.ts')) {
                unitTests.push(filePath);
            } else {
                sourceFiles.push(filePath);
            }
        });

        // Auditoria retroativa
        const auditor = new TestAuditor(this.projectRoot);
        const auditReport = auditor.auditAll(srcDir);

        const totalTests = unitTests.length + integrationTests.length + e2eTests.length;
        const testedFiles = new Set<string>();
        for (const t of unitTests) {
            testedFiles.add(t.replace('.test.ts', '.ts'));
        }

        const unitPct = totalTests > 0 ? (unitTests.length / totalTests) * 100 : 0;
        const intPct = totalTests > 0 ? (integrationTests.length / totalTests) * 100 : 0;
        const e2ePct = totalTests > 0 ? (e2eTests.length / totalTests) * 100 : 0;

        const pyramidHealthy =
            unitPct >= 70 &&
            intPct >= 10 && intPct <= 25 &&
            e2ePct <= 10 &&
            auditReport.healthScore >= 80;

        return {
            unitTests: unitTests.length,
            integrationTests: integrationTests.length,
            e2eTests: e2eTests.length,
            totalSourceFiles: sourceFiles.length,
            untestedFiles: sourceFiles.length - testedFiles.size,
            unitPercent: Math.round(unitPct),
            integrationPercent: Math.round(intPct),
            e2ePercent: Math.round(e2ePct),
            pyramidHealthy,
            auditReport,
        };
    }

    /**
     * Calcula quantos testes de cada tipo são necessários para atingir o equilíbrio 80/15/5,
     * usando análise de grafo de dependências e auditoria de qualidade.
     */
    planTestsByPyramid(srcDir: string = "src_local"): TestGenerationPlan {
        const metrics = this.scanPyramidMetrics(srcDir);
        
        // 1. Grafo de Dependências para alvos inteligentes
        const graph = new DependencyGraph(this.projectRoot);
        const graphResult = graph.build(srcDir);

        // 2. Auditoria para re-geração
        const auditor = new TestAuditor(this.projectRoot);
        const auditReport = auditor.auditAll(srcDir);

        // 3. Cálculo de metas ideais
        const sourceFiles = Array.from(graphResult.nodes.keys());
        const idealTotal = sourceFiles.length; 
        const idealUnit = Math.ceil(idealTotal * 0.80);
        const idealIntegration = Math.ceil(idealTotal * 0.15);
        const idealE2E = Math.ceil(idealTotal * 0.05);

        const unitNeeded = Math.max(0, idealUnit - metrics.unitTests);
        const intNeeded = Math.max(0, idealIntegration - metrics.integrationTests);
        const e2eNeeded = Math.max(0, idealE2E - metrics.e2eTests);

        // Alvos Unit: arquivos sem teste
        const untestedFiles = sourceFiles.filter(f => {
            const testPath = f.replace(/\.ts$/, '.test.ts');
            return !fs.existsSync(path.join(this.projectRoot, f.includes('src_local') ? f : path.join(srcDir, f)));
        });

        winston.info(`📐 [Pyramid Planner] Projetado: Unit=${idealUnit}, Integration=${idealIntegration}, E2E=${idealE2E}`);
        winston.info(`📐 [Pyramid Planner] Necessário: Unit=${unitNeeded}, Integration=${intNeeded}, E2E=${e2eNeeded}`);

        return {
            unitTestsNeeded: unitNeeded,
            integrationTestsNeeded: intNeeded,
            e2eTestsNeeded: e2eNeeded,
            unitTargets: untestedFiles.slice(0, unitNeeded),
            integrationTargets: graphResult.integrationPairs.slice(0, intNeeded),
            e2eTargets: graphResult.e2eCandidates.slice(0, e2eNeeded),
            regenerationTargets: auditReport.regenerationQueue,
        };
    }

    // ==========================================
    // GERADORES POR CAMADA DA PIRÂMIDE
    // ==========================================

    /**
     * CAMADA 1 — Unit Test (80%)
     */
    async generateUnitTest(filePath: string, orchestrator: Orchestrator): Promise<boolean> {
        winston.info(`🧪 [Unit Test] Gerando teste unitário PhD para: ${filePath}`);
        try {
            const analysis = await orchestrator.hubManager.analyzeFile(filePath);
            const sourceCode = fs.readFileSync(path.join(this.projectRoot, filePath), 'utf-8');
            const prompt = this.buildUnitTestPrompt(filePath, sourceCode, analysis);
            const testCode = await orchestrator.hubManager.reason(prompt);

            if (!this.validateGeneratedTest(testCode, filePath, 'unit', analysis)) {
                winston.warn(`❌ [Unit Test] Teste REJEITADO para ${filePath}: não passou na validação PhD.`);
                return false;
            }

            const testFilePath = filePath.replace(/\.ts$/, '.test.ts');
            fs.writeFileSync(path.join(this.projectRoot, testFilePath), testCode!);
            winston.info(`✨ [Unit Test] Teste PhD gerado: ${testFilePath}`);
            return true;
        } catch (e) {
            winston.error(`🧪 [Unit Test] Falha: ${e}`);
            return false;
        }
    }

    /**
     * CAMADA 2 — Integration Test (15%)
     */
    async generateIntegrationTest(fileA: string, fileB: string, orchestrator: Orchestrator): Promise<boolean> {
        winston.info(`🔗 [Integration Test] Gerando: ${fileA} <-> ${fileB}`);
        try {
            const contentA = fs.readFileSync(path.join(this.projectRoot, fileA), 'utf-8');
            const contentB = fs.readFileSync(path.join(this.projectRoot, fileB), 'utf-8');

            const prompt = this.buildIntegrationTestPrompt(fileA, fileB, contentA, contentB);
            const testCode = await orchestrator.hubManager.reason(prompt);

            if (!this.validateGeneratedTest(testCode, fileA, 'integration', null)) {
                winston.warn(`❌ [Integration Test] Teste REJEITADO: ${fileA} <-> ${fileB}`);
                return false;
            }

            const testFilePath = fileA.replace(/\.ts$/, '.integration.test.ts');
            fs.writeFileSync(path.join(this.projectRoot, testFilePath), testCode!);
            winston.info(`✨ [Integration Test] Gerado: ${testFilePath}`);
            return true;
        } catch (e) {
            winston.error(`🔗 [Integration Test] Falha: ${e}`);
            return false;
        }
    }

    /**
     * CAMADA 3 — E2E Test (5%)
     */
    async generateE2ETest(filePath: string, orchestrator: Orchestrator): Promise<boolean> {
        winston.info(`🌐 [E2E Test] Gerando teste end-to-end para: ${filePath}`);
        try {
            const sourceCode = fs.readFileSync(path.join(this.projectRoot, filePath), 'utf-8');

            // Encontrar dependências que esse módulo importa
            const imports = this.extractImports(sourceCode);
            let dependencyCode = '';
            for (const imp of imports.slice(0, 3)) {
                try {
                    const depPath = path.join(path.dirname(path.join(this.projectRoot, filePath)), imp);
                    if (fs.existsSync(depPath)) {
                        dependencyCode += `\n// --- ${imp} ---\n` + fs.readFileSync(depPath, 'utf-8').slice(0, 1500);
                    }
                } catch { /* skip */ }
            }

            const prompt = this.buildE2ETestPrompt(filePath, sourceCode, dependencyCode);
            const testCode = await orchestrator.hubManager.reason(prompt);

            if (!this.validateGeneratedTest(testCode, filePath, 'e2e', null)) {
                winston.warn(`❌ [E2E Test] Teste REJEITADO para ${filePath}`);
                return false;
            }

            const testFilePath = filePath.replace(/\.ts$/, '.e2e.test.ts');
            fs.writeFileSync(path.join(this.projectRoot, testFilePath), testCode!);
            winston.info(`✨ [E2E Test] Gerado: ${testFilePath}`);
            return true;
        } catch (e) {
            winston.error(`🌐 [E2E Test] Falha: ${e}`);
            return false;
        }
    }

    /** Método legado mantido por compatibilidade */
    async generateTestForFile(filePath: string, orchestrator: Orchestrator): Promise<boolean> {
        return this.generateUnitTest(filePath, orchestrator);
    }

    // ==========================================
    // VALIDADOR PÓS-GERAÇÃO (GATE KEEPER)
    // ==========================================

    /**
     * Rejeita testes que não atingem o nível PhD.
     * Retorna true se o teste é aceitável.
     */
    validateGeneratedTest(testCode: string | null | undefined, targetFile: string, layer: 'unit' | 'integration' | 'e2e', analysis: any): boolean {
        if (!testCode || testCode.length < 100) {
            winston.warn(`[Validator] REJEITADO: Código vazio ou muito curto.`);
            return false;
        }

        // 1. REGRA: Proibir smoke tests inúteis
        if (testCode.includes('expect(true).toBe(true)') || testCode.includes('expect(1).toBe(1)')) {
            winston.warn(`[Validator] REJEITADO: Contém smoke test proibido (expect(true).toBe(true)).`);
            return false;
        }

        // 2. REGRA: Deve importar o módulo-alvo real
        const basename = path.basename(targetFile, '.ts');
        if (!testCode.includes(`from`) || (!testCode.includes(basename) && !testCode.includes(targetFile))) {
            winston.warn(`[Validator] REJEITADO: Não importa o módulo-alvo '${basename}'.`);
            return false;
        }

        // 3. REGRA: Mínimo de asserções baseado na complexidade
        const expectCount = (testCode.match(/expect\(/g) || []).length;
        if (layer === 'unit') {
            const requiredMin = analysis?.functions
                ? Math.ceil(analysis.functions.reduce((acc: number, f: any) => acc + (f.cyclomatic_complexity || 1), 0) / 2) + 1
                : 3;
            if (expectCount < requiredMin) {
                winston.warn(`[Validator] REJEITADO: ${expectCount} asserções < mínimo ${requiredMin} (Regra CC/2+1).`);
                return false;
            }
        } else if (layer === 'integration') {
            if (expectCount < 3) {
                winston.warn(`[Validator] REJEITADO: Integration test com < 3 asserções.`);
                return false;
            }
        } else if (layer === 'e2e') {
            if (expectCount < 2) {
                winston.warn(`[Validator] REJEITADO: E2E test com < 2 asserções.`);
                return false;
            }
        }

        // 4. REGRA: Deve conter describe() e it()
        if (!testCode.includes('describe(') || !testCode.includes('it(')) {
            winston.warn(`[Validator] REJEITADO: Sem blocos describe/it adequados.`);
            return false;
        }

        winston.info(`[Validator] ✅ APROVADO: ${layer} test para ${targetFile} (${expectCount} asserções).`);
        return true;
    }

    // ==========================================
    // PROMPTS ESPECIALIZADOS POR CAMADA
    // ==========================================

    private buildUnitTestPrompt(filePath: string, sourceCode: string, analysis: any): string {
        const totalCC = analysis?.functions?.reduce((acc: number, f: any) => acc + (f.cyclomatic_complexity || 0), 0) || 5;
        const requiredAssertions = Math.ceil(totalCC / 2) + 1;

        const functions = analysis?.functions?.map((f: any) => {
            const params = f.params?.map((p: any) => `${p.name}: ${p.param_type}`).join(', ') || '';
            return `- ${f.is_async ? 'async ' : ''}${f.name}(${params}): ${f.return_type} (CC: ${f.cyclomatic_complexity})`;
        }).join('\n') || 'Contratos não disponíveis';

        return `
Você é o Dr. Test, PhD em QA. Gere um teste UNITÁRIO de ALTO NÍVEL para '${filePath}'.
Framework: Bun Test (\`bun:test\`).

CÓDIGO-FONTE:
\`\`\`typescript
${sourceCode}
\`\`\`

CONTRATOS EXTRAÍDOS (Tree-Sitter):
${functions}
Complexidade Ciclomática Total: ${totalCC}

REGRAS INVIOLÁVEIS DA PIRÂMIDE (Camada Unit — 80% do total):
1. **MÍNIMO ${requiredAssertions} asserções expect()** diferentes e significativas.
2. **PROIBIDO**: \`expect(true).toBe(true)\`, \`expect(1).toBe(1)\` — qualquer asserção trivial será REJEITADA.
3. **ISOLAR**: Cada função exportada DEVE ser testada individualmente. Use mocks/spyOn para dependências externas.
4. **EDGE CASES**: Testar null, undefined, arrays vazios, strings vazias, erros lançados.
5. **Coverage**: Cada branch (if/else/switch) deve ter pelo menos 1 caso de teste.
6. **Imports**: DEVE importar o módulo real: import { ... } from './${path.basename(filePath, '.ts')}';
7. **Saída**: APENAS código TypeScript puro. Sem explicações, sem markdown.
`;
    }

    private buildIntegrationTestPrompt(fileA: string, fileB: string, contentA: string, contentB: string): string {
        return `
Você é o Dr. Test, PhD em QA. Gere um teste de INTEGRAÇÃO REAL entre '${fileA}' e '${fileB}'.
Framework: Bun Test (\`bun:test\`).

MÓDULO A:
\`\`\`typescript
${contentA.slice(0, 3000)}
\`\`\`

MÓDULO B:
\`\`\`typescript
${contentB.slice(0, 3000)}
\`\`\`

REGRAS INVIOLÁVEIS DA PIRÂMIDE (Camada Integration — 15% do total):
1. **MÍNIMO 3 asserções expect()** significativas.
2. **PROIBIDO**: \`expect(true).toBe(true)\` — REJEITADO automaticamente.
3. **NÃO MOCKAR** o Módulo B: o teste de integração DEVE usar a implementação real dos dois módulos interagindo.
4. **TESTAR**: Fluxo de dados de A para B (ou B para A). Verificar que chamadas entre eles produzem os resultados esperados.
5. **EDGE CASES**: Testar quando A passa dados inválidos para B.
6. **Imports**: Importar AMBOS os módulos reais.
7. **Saída**: APENAS código TypeScript puro.
`;
    }

    private buildE2ETestPrompt(filePath: string, sourceCode: string, dependencyCode: string): string {
        return `
Você é o Dr. Test, PhD em QA. Gere um teste END-TO-END para '${filePath}'.
Framework: Bun Test (\`bun:test\`).

MÓDULO PRINCIPAL:
\`\`\`typescript
${sourceCode.slice(0, 3000)}
\`\`\`

DEPENDÊNCIAS (parciais):
\`\`\`typescript
${dependencyCode.slice(0, 2000)}
\`\`\`

REGRAS INVIOLÁVEIS DA PIRÂMIDE (Camada E2E — 5% do total):
1. **MÍNIMO 2 asserções expect()** significativas.
2. **PROIBIDO**: \`expect(true).toBe(true)\`.
3. **TESTAR O FLUXO COMPLETO**: Instantiar o módulo, alimentá-lo com dados realistas, e verificar o resultado final de ponta a ponta.
4. **REALISMO**: Usar dados que simulem cenários reais de produção.
5. **TIMEOUTS**: Para operações async, usar timeout adequado.
6. **Saída**: APENAS código TypeScript puro.
`;
    }

    // ==========================================
    // UTILITÁRIOS
    // ==========================================

    private walkDir(dir: string, callback: (filePath: string) => void) {
        if (!fs.existsSync(dir)) return;
        for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
            const fullPath = path.join(dir, entry.name);
            if (entry.isDirectory()) {
                if (['node_modules', '.git', 'target', 'build', '.gemini'].includes(entry.name)) continue;
                this.walkDir(fullPath, callback);
            } else {
                callback(fullPath);
            }
        }
    }

    private findIntegrationPairs(sourceFiles: string[]): Array<[string, string]> {
        const pairs: Array<[string, string]> = [];
        for (const file of sourceFiles) {
            try {
                const content = fs.readFileSync(file, 'utf-8');
                const imports = this.extractImports(content);
                for (const imp of imports) {
                    const resolvedImp = path.resolve(path.dirname(file), imp);
                    if (sourceFiles.includes(resolvedImp) && resolvedImp !== file) {
                        pairs.push([file, resolvedImp]);
                        if (pairs.length >= 20) return pairs;
                    }
                }
            } catch { /* skip */ }
        }
        return pairs;
    }

    private extractImports(code: string): string[] {
        const matches = code.matchAll(/from\s+['"](\.[^'"]+)['"]/g);
        const result: string[] = [];
        for (const m of matches) {
            let imp = m[1];
            if (!imp.endsWith('.ts')) imp += '.ts';
            result.push(imp);
        }
        return result;
    }
}
