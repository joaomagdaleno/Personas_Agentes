
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
    private orchestrator: any; // Type as any to avoid circular dependency for now

    constructor(orchestrator: any = null) {
        this.orchestrator = orchestrator;
    }

    /**
     * Valida a integridade do sistema baseado no contexto.
     * (Simulação da lógica PhD legado que analisava score de fragilidade)
     */
    validateSystemIntegrity(context: any): { score: number; issues: any[] } {
        let score = 100;
        const issues: any[] = [];

        if (context && context.map) {
            for (const file in context.map) {
                const info = context.map[file];
                if (info.brittle) score -= 5;
                if (info.silent_error) score -= 10;
            }
        }

        return { score: Math.max(0, score), issues };
    }

    /**
     * Executa a bateria de testes internos de integridade.
     */
    async verifyCoreHealth(projectRoot: string, changedFiles: string[] = []): Promise<any> {
        const testsDir = join(projectRoot, "tests");

        // Só executa se houver uma pasta de testes no alvo
        if (!existsSync(testsDir)) {
            logger.info("🛡️ [Core] Protocolo de Auto-Exame ignorado: Pasta 'tests' não encontrada.");
            return { success: true, pass_rate: 100, total_run: 0, failed: 0, skipped: true };
        }

        logger.info("🛡️ [Core] Iniciando Protocolo de Auto-Exame Vital...");

        try {
            const runner = new TestRunner();

            // Se tivermos poucos arquivos alterados (ex: < 5), usamos teste seletivo para velocidade extrema
            if (changedFiles && changedFiles.length > 0 && changedFiles.length < 10) {
                logger.info(`🧪 [Core] Executando Verificação Cirúrgica (Selective) para ${changedFiles.length} arquivos.`);
                return await runner.runSelectiveTests(projectRoot, changedFiles);
            }

            logger.info(`🧪 [Core] Executando Protocolo de Aceleração (Full Suite) em: ${projectRoot}`);
            const results = await runner.runParallelDiscovery(projectRoot);

            logger.info("📝 [Core] Consolidando resultados do auto-exame...");
            return results;
        } catch (error) {
            logger.error(`🚨 Falha crítica na execução do protocolo de auto-exame: ${error}`);
            return { success: false, pass_rate: 0, total_run: 0, failed: 1, error: String(error) };
        }
    }

    /**
     * ⚖️ Verifica Paridade de Plataforma (Legacy Compat).
     * Garante que não estamos regredindo lógica Python vs JS.
     */
    private _check_platform_parity(context: any): boolean {
        // Placeholder implementation - LogicAuditor handles most of this now
        if (!context || !context.files) return true;
        return true;
    }

    /**
     * 📊 Analisa resultados brutos (Helper).
     */
    private _parse_results(results: any): any {
        if (!results.raw_output) return results;

        const output = typeof results.raw_output === 'string' ? results.raw_output : "";
        const passed = this._extract_count(output, /(\d+) pass/);
        const failed = this._extract_count(output, /(\d+) fail/);

        return {
            ...results,
            passed,
            failed,
            total: passed + failed
        };
    }

    private _extract_count(text: string, regex: RegExp): number {
        const match = text.match(regex);
        return match ? parseInt(match[1] || "0") : 0;
    }
}
