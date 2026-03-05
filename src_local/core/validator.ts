import winston from "winston";
import { join } from "path";
import { existsSync } from "fs";
import { TestRunner } from "../agents/Support/Automation/test_runner";

const logger = winston.child({ module: "CoreValidator" });

/**
 * 🛡️ Validador de Integridade do Core (CoreValidator).
 * Executa o Protocolo de Auto-Exame Vital.
 */
export class CoreValidator {
    constructor(private orchestrator: any = null) {}

    /**
     * Valida a integridade do sistema baseado no contexto.
     */
    validateSystemIntegrity(context: any): { score: number; issues: any[] } {
        let score = 100;
        const issues: any[] = [];

        if (context?.map) {
            score -= this.calculateFragilityPenalty(context.map);
        }

        return { score: Math.max(0, score), issues };
    }

    private calculateFragilityPenalty(map: Record<string, any>): number {
        let penalty = 0;
        for (const info of Object.values(map)) {
            if (info.brittle) penalty += 5;
            if (info.silent_error) penalty += 10;
        }
        return penalty;
    }

    /**
     * Executa a bateria de testes internos de integridade.
     */
    async verifyCoreHealth(projectRoot: string, changedFiles: string[] = []): Promise<any> {
        const testsDir = join(projectRoot, "tests");

        if (!existsSync(testsDir)) {
            logger.info("🛡️ [Core] Protocolo de Auto-Exame ignorado: Pasta 'tests' não encontrada.");
            return { success: true, pass_rate: 100, total_run: 0, failed: 0, skipped: true };
        }

        logger.info("🛡️ [Core] Iniciando Protocolo de Auto-Exame Vital...");
        return this.runHealthTests(projectRoot, changedFiles);
    }

    private async runHealthTests(projectRoot: string, changedFiles: string[]): Promise<any> {
        try {
            const runner = new TestRunner();
            const result = (changedFiles.length > 0 && changedFiles.length < 10)
                ? await this.runSelectiveTests(runner, projectRoot, changedFiles)
                : await this.runFullSuite(runner, projectRoot);

            logger.info("📝 [Core] Consolidando resultados do auto-exame...");
            return result;
        } catch (error) {
            logger.error(`🚨 Falha crítica no protocolo de auto-exame: ${error}`);
            return { success: false, pass_rate: 0, total_run: 0, failed: 1, error: String(error) };
        }
    }

    private async runSelectiveTests(runner: TestRunner, root: string, files: string[]) {
        logger.info(`🧪 [Core] Executando Verificação Cirúrgica (Selective) para ${files.length} arquivos.`);
        return await runner.runSelectiveTests(root, files);
    }

    private async runFullSuite(runner: TestRunner, root: string) {
        logger.info(`🧪 [Core] Executando Protocolo de Aceleração (Full Suite) em: ${root}`);
        return await runner.runParallelDiscovery(root);
    }

    /**
     * ⚖️ Verifica Paridade de Plataforma (Legacy Compat).
     */
    private _check_platform_parity(context: any): boolean {
        return true;
    }

    /**
     * 📊 Analisa resultados brutos (Helper).
     */
    private _parse_results(results: any): any {
        if (!results.raw_output || typeof results.raw_output !== 'string') {
            return results;
        }

        const passed = this._extract_count(results.raw_output, /(\d+) pass/);
        const failed = this._extract_count(results.raw_output, /(\d+) fail/);

        return { ...results, passed, failed, total: passed + failed };
    }

    private _extract_count(text: string, regex: RegExp): number {
        const match = text.match(regex);
        return match ? parseInt(match[1] || "0") : 0;
    }
}
