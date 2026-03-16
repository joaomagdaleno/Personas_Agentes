import * as fs from 'fs';
import * as path from 'path';
import winston from 'winston';

/**
 * 🔍 Auditor Retroativo de Testes.
 * 
 * Analisa os testes existentes e classifica em 4 níveis de qualidade:
 *   - SMOKE (Nível 0): expect(true).toBe(true), test('should exist') → REPROVAR
 *   - BASIC (Nível 1): Importa o módulo mas < 3 asserções ou testa só tipos → REPROVAR
 *   - GOOD  (Nível 2): ≥ 3 asserções, testa lógica real, usa mocks → MANTER
 *   - PHD   (Nível 3): ≥ 5 asserções, edge cases, async, property-based → MANTER
 *
 * Referência: Google Testing Blog (80/15/5), Martin Fowler (TestPyramid).
 */

export type TestQualityLevel = 'SMOKE' | 'BASIC' | 'GOOD' | 'PHD';

export interface TestAuditResult {
    testFile: string;          // Caminho relativo
    sourceFile: string;        // Arquivo fonte correspondente
    level: TestQualityLevel;   // Classificação
    expectCount: number;       // Número de expect()
    hasDescribe: boolean;      // Usa describe()
    hasIt: boolean;            // Usa it()
    hasMock: boolean;          // Usa mock/spyOn
    hasEdgeCases: boolean;     // Testa null/undefined/empty
    hasAsync: boolean;         // Usa async/await nos testes
    hasPropertyBased: boolean; // Usa fast-check ou fc.assert
    importsTarget: boolean;    // Importa o módulo-alvo real
    hasTrivialAssert: boolean; // Contém expect(true).toBe(true)
    shouldRegenerate: boolean; // Flag para re-geração
    reason: string;            // Justificativa humana
}

export interface TestAuditReport {
    total: number;
    smoke: number;
    basic: number;
    good: number;
    phd: number;
    regenerationQueue: TestAuditResult[];
    healthScore: number; // 0-100 baseado no mix
}

export class TestAuditor {
    private projectRoot: string;

    constructor(projectRoot: string) {
        this.projectRoot = projectRoot;
    }

    /**
     * Audita todos os arquivos de teste no diretório especificado.
     */
    auditAll(srcDir: string = 'src_local'): TestAuditReport {
        const rootPath = path.join(this.projectRoot, srcDir);
        const results: TestAuditResult[] = [];

        this.walkDir(rootPath, (filePath: string) => {
            const name = path.basename(filePath);
            if (name.endsWith('.test.ts')) {
                const result = this.auditSingleTest(filePath);
                if (result) results.push(result);
            }
        });

        const smoke = results.filter(r => r.level === 'SMOKE').length;
        const basic = results.filter(r => r.level === 'BASIC').length;
        const good = results.filter(r => r.level === 'GOOD').length;
        const phd = results.filter(r => r.level === 'PHD').length;
        const total = results.length;

        // Health Score: ponderar por qualidade
        const healthScore = total > 0
            ? Math.round(((good * 70 + phd * 100) / (total * 100)) * 100)
            : 0;

        const regenerationQueue = results.filter(r => r.shouldRegenerate);

        winston.info(`🔍 [TestAuditor] Relatório: ${total} testes auditados. SMOKE: ${smoke}, BASIC: ${basic}, GOOD: ${good}, PHD: ${phd}. Health: ${healthScore}/100. Re-geração: ${regenerationQueue.length} arquivos.`);

        return {
            total,
            smoke,
            basic,
            good,
            phd,
            regenerationQueue,
            healthScore,
        };
    }

    /**
     * Audita um único arquivo de teste e retorna sua classificação.
     */
    auditSingleTest(testFilePath: string): TestAuditResult | null {
        try {
            const content = fs.readFileSync(testFilePath, 'utf-8');
            const relPath = path.relative(this.projectRoot, testFilePath);
            const basename = path.basename(testFilePath);

            // Determinar arquivo fonte correspondente
            let sourceFile = '';
            if (basename.endsWith('.e2e.test.ts')) {
                sourceFile = testFilePath.replace('.e2e.test.ts', '.ts');
            } else if (basename.endsWith('.integration.test.ts')) {
                sourceFile = testFilePath.replace('.integration.test.ts', '.ts');
            } else {
                sourceFile = testFilePath.replace('.test.ts', '.ts');
            }
            const relSource = path.relative(this.projectRoot, sourceFile);

            // Métricas
            const expectCount = (content.match(/expect\(/g) || []).length;
            const hasDescribe = content.includes('describe(');
            const hasIt = content.includes('it(');
            const hasMock = content.includes('mock(') || content.includes('spyOn(') || content.includes('Mock');
            const hasEdgeCases = /null|undefined|empty|NaN|Infinity|\[\]|''|""/.test(content);
            const hasAsync = content.includes('async') && content.includes('await');
            const hasPropertyBased = content.includes('fc.assert') || content.includes('fast-check') || content.includes('fc.property');

            const sourceBasename = path.basename(sourceFile, '.ts');
            const importsTarget = content.includes(`from`) && (
                content.includes(sourceBasename) || content.includes(`./${sourceBasename}`)
            );

            const hasTrivialAssert =
                content.includes('expect(true).toBe(true)') ||
                content.includes('expect(1).toBe(1)') ||
                content.includes('expect(true).toBeTruthy()');

            // Classificação por regras rigorosas
            let level: TestQualityLevel;
            let reason: string;
            let shouldRegenerate: boolean;

            if (hasTrivialAssert && expectCount <= 2) {
                level = 'SMOKE';
                reason = 'Smoke test com expect(true).toBe(true) — sem valor de QA.';
                shouldRegenerate = true;
            } else if (!importsTarget) {
                level = 'SMOKE';
                reason = 'Não importa o módulo-alvo. É um teste fantasma.';
                shouldRegenerate = true;
            } else if (expectCount < 3) {
                level = 'BASIC';
                reason = `Apenas ${expectCount} asserção(ões). Insuficiente para cobertura real.`;
                shouldRegenerate = true;
            } else if (!hasMock && !hasEdgeCases && expectCount < 5) {
                level = 'BASIC';
                reason = 'Sem mocking e sem edge cases. Teste superficial.';
                shouldRegenerate = true;
            } else if (expectCount >= 5 && hasEdgeCases && (hasMock || hasAsync)) {
                level = 'PHD';
                reason = `Excelente: ${expectCount} asserções, edge cases, ${hasMock ? 'mocking' : 'async testing'}.`;
                shouldRegenerate = false;
            } else {
                level = 'GOOD';
                reason = `Aceitável: ${expectCount} asserções, ${hasMock ? 'com mocking' : 'sem mocking'}.`;
                shouldRegenerate = false;
            }

            // Testes vazios (arquivo < 50 bytes)
            if (content.trim().length < 50) {
                level = 'SMOKE';
                reason = 'Arquivo de teste vazio ou quase vazio.';
                shouldRegenerate = true;
            }

            return {
                testFile: relPath,
                sourceFile: relSource,
                level,
                expectCount,
                hasDescribe,
                hasIt,
                hasMock,
                hasEdgeCases,
                hasAsync,
                hasPropertyBased,
                importsTarget,
                hasTrivialAssert,
                shouldRegenerate,
                reason,
            };
        } catch (e) {
            winston.warn(`[TestAuditor] Não foi possível auditar ${testFilePath}: ${e}`);
            return null;
        }
    }

    /**
     * Gera um resumo legível da auditoria para o System Tray ou Dashboard.
     */
    formatReport(report: TestAuditReport): string {
        const lines: string[] = [
            `📊 AUDITORIA DE QUALIDADE DOS TESTES`,
            `══════════════════════════════════════`,
            `Total de testes: ${report.total}`,
            ``,
            `🔴 SMOKE (Nível 0 - Inúteis):     ${report.smoke}`,
            `🟡 BASIC (Nível 1 - Fracos):       ${report.basic}`,
            `🟢 GOOD  (Nível 2 - Aceitáveis):   ${report.good}`,
            `🏆 PHD   (Nível 3 - Excelentes):    ${report.phd}`,
            ``,
            `Health Score: ${report.healthScore}/100`,
            `Fila de Re-geração: ${report.regenerationQueue.length} arquivos`,
        ];

        if (report.regenerationQueue.length > 0) {
            lines.push('', '📋 FILA DE RE-GERAÇÃO:');
            for (const item of report.regenerationQueue.slice(0, 15)) {
                lines.push(`  ❌ [${item.level}] ${item.testFile} → ${item.reason}`);
            }
        }

        return lines.join('\n');
    }

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
}
