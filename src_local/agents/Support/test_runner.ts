import winston from 'winston';
import { spawn } from 'child_process';
import { Path } from '../../core/path_utils';

/**
 * 🏎️ Executor de Testes PhD (Bun Bridge).
 */
export class TestRunner {
    async runUnittestDiscover(projectRoot: string): Promise<any> {
        const startT = Date.now();
        winston.info(`⏱️ [TestRunner] Iniciando suíte de testes em ${projectRoot}...`);

        if (!projectRoot) return { success: false, error: "Project root missing" };

        return new Promise((resolve) => {
            // No Bun, usamos 'bun test' mas para compatibilidade com o legado Python 'unittest',
            // podemos tentar rodar via python ou adaptar para os testes TS.
            // Para a migração, vamos assumir que queremos rodar os testes TS via 'bun test'.
            const child = spawn('bun', ['test'], {
                cwd: projectRoot,
                shell: true
            });

            let stdout = '';
            let stderr = '';

            child.stdout.on('data', (data) => stdout += data);
            child.stderr.on('data', (data) => stderr += data);

            child.on('close', (code) => {
                const duration = (Date.now() - startT) / 1000;
                winston.info(`⏱️ [TestRunner] Execução concluída em ${duration.toFixed(2)}s`);
                resolve(this.parseBunOutput(stdout + stderr, code === 0));
            });
        });
    }

    private parseBunOutput(output: string, isSuccess: boolean): any {
        // Exemplo: "34 pass, 0 fail, 34 total"
        const passMatch = output.match(/(\d+) pass/);
        const failMatch = output.match(/(\d+) fail/);

        const passed = passMatch ? parseInt(passMatch[1]) : 0;
        const failed = failMatch ? parseInt(failMatch[1]) : 0;
        const total = passed + failed;

        return {
            success: isSuccess && failed === 0,
            total_run: total,
            failed: failed,
            pass_rate: total > 0 ? Number(((passed / total) * 100).toFixed(2)) : 0,
            raw_output: output
        };
    }
}
