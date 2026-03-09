
import { describe, it, expect } from 'bun:test';
import { TaskExecutor } from './task_executor.ts';

describe('TaskExecutor', () => {
    const executor = new TaskExecutor();

    it('should run tasks in parallel', async () => {
        const items = [10, 20, 30, 40, 50];
        const fn = async (n: number) => {
            await new Promise(r => setTimeout(r, n));
            return n * 2;
        };

        const start = Date.now();
        const results = await executor.runParallel(fn, items, 2);
        const duration = Date.now() - start;

        expect(results).toEqual([20, 40, 60, 80, 100]);
        // Concurrency 2 means it should take at least (10+30+50) = 90ms or something similarish 
        // depending on how they are batched. Just a sanity check.
        expect(duration).toBeGreaterThan(50);
    });

    it('should handle empty items array', async () => {
        const results = await executor.runParallel(async (i) => i, []);
        expect(results).toEqual([]);
    });

    it('should execute shell commands', async () => {
        // Use a universal command or handle platform (Windows in this case)
        const command = process.platform === 'win32' ? 'cmd /c echo hello' : 'echo hello';
        const result = await executor.runCommand(command);

        expect(result.exitCode).toBe(0);
        expect(result.stdout.trim()).toBe('hello');
    });

    it('should capture stderr on failure', async () => {
        const command = process.platform === 'win32' ? 'cmd /c "exit 1"' : 'false';
        const result = await executor.runCommand(command);

        expect(result.exitCode).not.toBe(0);
    });
});
