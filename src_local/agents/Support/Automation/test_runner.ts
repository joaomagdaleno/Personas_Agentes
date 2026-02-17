import winston from 'winston';
import { spawn } from 'node:child_process';

/**
 * Test results interface
 */
export interface TestResults {
    success: boolean;
    total_run: number;
    failed: number;
    pass_rate: number;
    raw_output: string;
    message?: string;
    error?: string;
}

/**
 * Benchmark results interface
 */
export interface BenchmarkResults extends TestResults {
    duration_seconds: number;
    timestamp: string;
}

/**
 * 🏎️ Executor de Testes PhD (Bun Bridge).
 */
export class TestRunner {
    /** Parity: __init__ */
    constructor() {
        this._ensure_components();
    }

    /** Parity: _ensure_components — Validates runtime dependencies. */
    private _ensure_components(): void {
        // Bun runtime is the only dependency; validated at spawn time.
    }

    /** Parity: _consolidate_results — Merges multiple test result sets. */
    private _consolidate_results(results: TestResults[]): TestResults {
        const total = results.reduce((s, r) => s + r.total_run, 0);
        const failed = results.reduce((s, r) => s + r.failed, 0);
        const passed = total - failed;
        return {
            success: results.every(r => r.success),
            total_run: total,
            failed,
            pass_rate: total > 0 ? Number(((passed / total) * 100).toFixed(2)) : 0,
            raw_output: results.map(r => r.raw_output).join("\n"),
        };
    }

    /** Parity: _parse_output — Alias for parseBunOutput. */
    private _parse_output(output: string, isSuccess: boolean): TestResults {
        return this.parseBunOutput(output, isSuccess);
    }

    async runUnittestDiscover(projectRoot: string): Promise<TestResults> {
        return this.runParallelDiscovery(projectRoot);
    }

    /**
     * Executa todos os testes (descoberta paralela via Bun).
     */
    async runParallelDiscovery(projectRoot: string): Promise<TestResults> {
        const startT = Date.now();
        winston.info(`⏱️ [TestRunner] Iniciando suíte de testes completa em ${projectRoot}...`);

        if (!projectRoot) {
            return {
                success: false,
                error: "Project root missing",
                total_run: 0,
                failed: 0,
                pass_rate: 0,
                raw_output: ""
            };
        }

        // 'bun test' runs in parallel by default
        return this.executeBunTest(projectRoot, []);
    }

    /**
     * Executa apenas testes específicos (Cirúrgico).
     */
    async runSelectiveTests(projectRoot: string, files: string[]): Promise<TestResults> {
        winston.info(`🧪 [TestRunner] Execução Seletiva: ${files.length} arquivos.`);

        // Filter only test files (spec/test)
        const testFiles = files.filter(f => f.includes(".test.") || f.includes(".spec."));
        if (testFiles.length === 0) {
            return {
                success: true,
                total_run: 0,
                failed: 0,
                pass_rate: 0,
                raw_output: "",
                message: "No test files in changed set."
            };
        }

        return this.executeBunTest(projectRoot, testFiles);
    }

    private async executeBunTest(cwd: string, args: string[]): Promise<TestResults> {
        return new Promise((resolve, reject) => {
            try {
                const child = spawn('bun', ['test', ...args], {
                    cwd: cwd,
                    shell: true
                });

                let stdout = '';
                let stderr = '';

                child.stdout.on('data', (data) => stdout += data);
                child.stderr.on('data', (data) => stderr += data);

                child.on('close', (code) => {
                    const output = (stdout || "") + (stderr || "");
                    resolve(this.parseBunOutput(output, code === 0));
                });

                child.on('error', (error) => {
                    winston.error(`❌ [TestRunner] Erro ao executar bun test: ${error.message}`);
                    reject({
                        success: false,
                        error: error.message,
                        total_run: 0,
                        failed: 0,
                        pass_rate: 0,
                        raw_output: error.message
                    });
                });
            } catch (error: any) {
                winston.error(`❌ [TestRunner] Erro ao iniciar processo: ${error.message}`);
                reject({
                    success: false,
                    error: error.message,
                    total_run: 0,
                    failed: 0,
                    pass_rate: 0,
                    raw_output: error.message
                });
            }
        });
    }

    private parseBunOutput(output: string, isSuccess: boolean): TestResults {
        // Exemplo: "34 pass, 0 fail, 34 total"
        const passMatch = output.match(/(\d+) pass/);
        const failMatch = output.match(/(\d+) fail/);

        const passed = passMatch ? parseInt(passMatch[1] || "0") : 0;
        const failed = failMatch ? parseInt(failMatch[1] || "0") : 0;
        const total = passed + failed;

        return {
            success: isSuccess && failed === 0,
            total_run: total,
            failed: failed,
            pass_rate: total > 0 ? Number(((passed / total) * 100).toFixed(2)) : 0,
            raw_output: output
        };
    }

    /**
     * Realiza um benchmark da suíte de testes.
     */
    async benchmark(projectRoot: string): Promise<BenchmarkResults> {
        const start = Date.now();
        const results = await this.runParallelDiscovery(projectRoot);
        const duration = (Date.now() - start) / 1000;

        return {
            ...results,
            duration_seconds: duration,
            timestamp: new Date().toISOString()
        };
    }
}
