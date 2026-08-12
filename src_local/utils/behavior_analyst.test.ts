
import { describe, it, expect, beforeEach, afterEach, mock, spyOn } from 'bun:test';
import { Database } from "bun:sqlite";
import { BehaviorAnalyst } from './behavior_analyst.ts';
import { join } from 'node:path';
import { rmSync, existsSync } from 'node:fs';

describe('BehaviorAnalyst', () => {
    const testRoot = join(process.cwd(), 'tmp_behavior_test');
    let analyst: BehaviorAnalyst;

    beforeEach(() => {
        if (!existsSync(testRoot)) {
            require('fs').mkdirSync(testRoot, { recursive: true });
        }
        analyst = new BehaviorAnalyst(testRoot);
        // Initialize table via dbHub directly if needed, or rely on DatabaseHub creating it
        analyst['dbHub'].run("CREATE TABLE IF NOT EXISTS user_activity (id INTEGER PRIMARY KEY, app_name TEXT, category TEXT, duration_seconds INTEGER, timestamp DATETIME DEFAULT CURRENT_TIMESTAMP)");
    });

    afterEach(() => {
        if (analyst['dbHub']) {
            analyst['dbHub'].close();
        }
        if (existsSync(testRoot)) {
            rmSync(testRoot, { recursive: true, force: true });
        }
    });

    it('should detect active window with mock', async () => {
        // Mock the internal PowerShell runner using spyOn
        const spy = spyOn(analyst as any, 'runWin32PowerShellAsync').mockResolvedValue({ app: 'Code', title: 'BehaviorAnalyst.test.ts' });

        const win = await analyst.getActiveWindow();
        expect(win.app).toBe('Code');
        expect(win.title).toBe('BehaviorAnalyst.test.ts');
        expect(spy).toHaveBeenCalled();
    });

    it('should classify and log activity', async () => {
        spyOn(analyst as any, 'runWin32PowerShellAsync').mockResolvedValue({ app: 'Code', title: 'BehaviorAnalyst.test.ts' });

        const category = await analyst.logActivity();
        expect(category).toBeDefined();
        expect(analyst['lastApp']).toBe('Code');
    });

    it('should save activity on focus change', async () => {
        const spy = spyOn(analyst as any, 'runWin32PowerShellAsync');
        spy.mockResolvedValue({ app: 'Code', title: 'BehaviorAnalyst.test.ts' });
        await analyst.logActivity();

        analyst['startTime'] = Date.now() - 30000;
        analyst['windowCache'] = null; // Force refresh to pick up new mock

        // Change window to trigger save
        spy.mockResolvedValue({ app: 'Chrome', title: 'Google' });
        await analyst.logActivity();

        const results = analyst['dbHub'].query("SELECT * FROM user_activity WHERE app_name = 'Code'").all();
        expect(results.length).toBeGreaterThan(0);
    });
});
