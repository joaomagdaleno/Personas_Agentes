
import { describe, it, expect, beforeEach, mock, spyOn } from 'bun:test';
import { SystemSentinel } from './system_sentinel.ts';
import { HealthCollector } from './strategies/HealthCollector.ts';

describe('SystemSentinel', () => {
    let sentinel: SystemSentinel;

    beforeEach(() => {
        sentinel = new SystemSentinel();
        // Clear cache
        sentinel['healthCache'] = null;
    });

    it('should fallback to HealthCollector if Hub is unavailable', async () => {
        // Mock fetch failure
        (global as any).fetch = mock(async () => { throw new Error('Unavailable') });

        const mockHealth = { memory_usage: '50%', cpu_usage: 10, heavy_processes: [] };
        const spy = spyOn(HealthCollector, 'collect').mockReturnValue(mockHealth);

        const health = await sentinel.getSystemHealth();

        expect(health).toEqual(mockHealth);
        expect(spy).toHaveBeenCalled();
    });

    it('should use fetch if Hub is available', async () => {
        const mockStatus = { metrics: { memory_usage: '40%', cpu_usage: 5, heavy_processes: [] } };
        (global as any).fetch = mock(async () => ({
            ok: true,
            json: async () => mockStatus
        }) as any);

        const health = await sentinel.getSystemHealth();

        expect(health).toEqual(mockStatus.metrics);
    });

    it('should suggest optimizations based on health', async () => {
        sentinel['healthCache'] = {
            data: { memory_usage: '90%', cpu_usage: 80, heavy_processes: [] },
            timestamp: Date.now()
        };

        const suggestions = await sentinel.suggestOptimizations();
        expect(suggestions).toContain("⚠️ RAM crítica (>85%).");
        expect(suggestions).toContain("⚠️ Alta carga de CPU.");
    });

    it('should identify bloatware to kill', async () => {
        sentinel['healthCache'] = {
            data: {
                heavy_processes: [
                    { name: 'OneDrive.exe', mem_mb: '100' },
                    { name: 'MyApp.exe', mem_mb: '200' }
                ]
            },
            timestamp: Date.now()
        };

        const bloat = await sentinel.analyze_and_kill_bloatware();
        expect(bloat.length).toBe(1);
        if (bloat[0]) {
            expect(bloat[0].process).toBe('OneDrive.exe');
        }
    });
});
