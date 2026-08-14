import winston from 'winston';
import { spawn } from 'node:child_process';

const logger = winston.child({ module: "TestRunner" });

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

    private getZigCommand(): string {
        const fs = require('node:fs');
        if (fs.existsSync('/home/jules/zig-0.13.0/zig')) {
            return '/home/jules/zig-0.13.0/zig';
        }
        return 'zig';
    }

    async runUnittestDiscover(projectRoot: string): Promise<TestResults> {
        const fs = require('node:fs');
        const path = require('node:path');
        const hasBuildZig = fs.existsSync(path.join(projectRoot, "build.zig"));

        const bunResults = await this.runParallelDiscovery(projectRoot);

        if (hasBuildZig) {
            logger.info("⚡ [TestRunner] build.zig detectado! Executando suíte de testes nativos Zig...");
            const zigResults = await new Promise<TestResults>((resolve) => {
                const zigCmd = this.getZigCommand();
                const child = spawn(zigCmd, ['build', 'test'], {
                    cwd: projectRoot,
                    shell: true
                });

                let stdout = '';
                let stderr = '';

                child.stdout.on('data', (data) => stdout += data);
                child.stderr.on('data', (data) => stderr += data);

                child.on('close', (code) => {
                    const output = (stdout || "") + (stderr || "");
                    const success = code === 0;
                    resolve({
                        success,
                        total_run: success ? 1 : 0,
                        failed: success ? 0 : 1,
                        pass_rate: success ? 100 : 0,
                        raw_output: output
                    });
                });

                child.on('error', (err) => {
                    resolve({
                        success: false,
                        error: err.message,
                        total_run: 0,
                        failed: 1,
                        pass_rate: 0,
                        raw_output: err.message
                    });
                });
            });

            return this._consolidate_results([bunResults, zigResults]);
        }

        return bunResults;
    }

    /**
     * Executa todos os testes (descoberta paralela via Bun).
     */
    async runParallelDiscovery(projectRoot: string): Promise<TestResults> {
        const startT = Date.now();
        logger.info(`⏱️ [TestRunner] Iniciando suíte de testes completa em ${projectRoot}...`);

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
        logger.info(`🧪 [TestRunner] Execução Seletiva: ${files.length} arquivos.`);

        const testFiles = files.filter(f => f.includes(".test.") || f.includes(".spec."));
        const zigFiles = files.filter(f => f.endsWith(".zig"));

        const results: TestResults[] = [];

        if (testFiles.length > 0) {
            const bunRes = await this.executeBunTest(projectRoot, testFiles);
            results.push(bunRes);
        }

        if (zigFiles.length > 0) {
            logger.info(`⚡ [TestRunner] Executando testes Zig cirúrgicos para: ${zigFiles.join(', ')}`);
            const zigRes = await this.executeZigTest(projectRoot, zigFiles);
            results.push(zigRes);
        }

        if (results.length === 0) {
            return {
                success: true,
                total_run: 0,
                failed: 0,
                pass_rate: 0,
                raw_output: "",
                message: "No test files in changed set."
            };
        }

        return this._consolidate_results(results);
    }

    private async executeZigTest(cwd: string, testFiles: string[]): Promise<TestResults> {
        const zigCmd = this.getZigCommand();
        const results: TestResults[] = [];

        for (const file of testFiles) {
            const res = await new Promise<TestResults>((resolve) => {
                try {
                    const child = spawn(zigCmd, ['test', file], {
                        cwd: cwd
                    });

                    let stdout = '';
                    let stderr = '';

                    child.stdout.on('data', (data) => stdout += data);
                    child.stderr.on('data', (data) => stderr += data);

                    child.on('close', (code) => {
                        const output = (stdout || "") + (stderr || "");
                        const failed = output.includes("failed") || code !== 0;
                        const totalMatch = output.match(/All (\d+) tests passed/);
                        const passed = totalMatch ? parseInt(totalMatch[1]) : (failed ? 0 : 1);
                        const failedCount = failed ? 1 : 0;
                        const total = passed + failedCount;

                        resolve({
                            success: code === 0 && !failed,
                            total_run: total,
                            failed: failedCount,
                            pass_rate: total > 0 ? Number(((passed / total) * 100).toFixed(2)) : 0,
                            raw_output: output
                        });
                    });

                    child.on('error', (error) => {
                        resolve({
                            success: false,
                            error: error.message,
                            total_run: 0,
                            failed: 1,
                            pass_rate: 0,
                            raw_output: error.message
                        });
                    });
                } catch (error: any) {
                    resolve({
                        success: false,
                        error: error.message,
                        total_run: 0,
                        failed: 1,
                        pass_rate: 0,
                        raw_output: error.message
                    });
                }
            });
            results.push(res);
        }

        return this._consolidate_results(results);
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
                    logger.error(`❌ [TestRunner] Erro ao executar bun test: ${error.message}`);
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
                logger.error(`❌ [TestRunner] Erro ao iniciar processo: ${error.message}`);
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
