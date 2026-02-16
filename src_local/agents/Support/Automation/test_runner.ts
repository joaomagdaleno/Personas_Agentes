import winston from 'winston';
import { spawn } from 'node:child_process';


/**
 * 🏎️ Executor de Testes PhD (Bun Bridge).
 */
export class TestRunner {
    async runUnittestDiscover(projectRoot: string): Promise<any> {
        return this.runParallelDiscovery(projectRoot);
    }

    /**
     * Executa todos os testes (descoberta paralela via Bun).
     */
    async runParallelDiscovery(projectRoot: string): Promise<any> {
        const startT = Date.now();
        winston.info(`⏱️ [TestRunner] Iniciando suíte de testes completa em ${projectRoot}...`);

        if (!projectRoot) return { success: false, error: "Project root missing" };

        // 'bun test' runs in parallel by default
        return this.executeBunTest(projectRoot, []);
    }

    /**
     * Executa apenas testes específicos (Cirúrgico).
     */
    async runSelectiveTests(projectRoot: string, files: string[]): Promise<any> {
        winston.info(`🧪 [TestRunner] Execução Seletiva: ${files.length} arquivos.`);

        // Filter only test files (spec/test)
        const testFiles = files.filter(f => f.includes(".test.") || f.includes(".spec."));
        if (testFiles.length === 0) {
            return { success: true, total_run: 0, message: "No test files in changed set." };
        }

        return this.executeBunTest(projectRoot, testFiles);
    }

    private async executeBunTest(cwd: string, args: string[]): Promise<any> {
        return new Promise((resolve) => {
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
        });
    }

    private parseBunOutput(output: string, isSuccess: boolean): any {
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
    async benchmark(projectRoot: string): Promise<any> {
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
