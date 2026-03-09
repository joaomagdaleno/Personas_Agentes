
import { describe, it, expect, beforeEach, afterEach, mock, spyOn } from 'bun:test';
import { Database } from "bun:sqlite";
import { BehaviorAnalyst } from './behavior_analyst.ts';
import { join } from 'node:path';
import { rmSync, existsSync } from 'node:fs';

describe('BehaviorAnalyst', () => {
    const testRoot = join(process.cwd(), 'tmp_behavior_test');
    let analyst: BehaviorAnalyst;

    beforeEach(() => {
        const db = new Database(":memory:");
        analyst = new BehaviorAnalyst(testRoot, db);
        // Initialize table
        db.run("CREATE TABLE IF NOT EXISTS user_activity (id INTEGER PRIMARY KEY, app_name TEXT, category TEXT, duration_seconds INTEGER, timestamp DATETIME DEFAULT CURRENT_TIMESTAMP)");
    });

    afterEach(() => {
        analyst['db'].close();
        if (existsSync(testRoot)) {
            rmSync(testRoot, { recursive: true, force: true });
        }
    });

    it('should detect active window with mock', () => {
        // Mock the internal PowerShell runner using spyOn
        const spy = spyOn(analyst as any, 'runWin32PowerShell').mockReturnValue({ app: 'Code', title: 'BehaviorAnalyst.test.ts' });

        const win = analyst.getActiveWindow();
        expect(win.app).toBe('Code');
        expect(win.title).toBe('BehaviorAnalyst.test.ts');
        expect(spy).toHaveBeenCalled();
    });

    it('should classify and log activity', () => {
        spyOn(analyst as any, 'runWin32PowerShell').mockReturnValue({ app: 'Code', title: 'BehaviorAnalyst.test.ts' });

        const category = analyst.logActivity();
        expect(category).toBeDefined();
        expect(analyst['lastApp']).toBe('Code');
    });

    it('should save activity on focus change', () => {
        const spy = spyOn(analyst as any, 'runWin32PowerShell');
        spy.mockReturnValue({ app: 'Code', title: 'BehaviorAnalyst.test.ts' });
        analyst.logActivity();

        analyst['startTime'] = Date.now() - 30000;
        analyst['windowCache'] = null; // Force refresh to pick up new mock

        // Change window to trigger save
        (analyst as any).runWin32PowerShell = mock(() => ({ app: 'Chrome', title: 'Google' }));
        analyst.logActivity();

        const results = analyst['db'].query("SELECT * FROM user_activity WHERE app_name = 'Code'").all();
        expect(results.length).toBeGreaterThan(0);
    });
});
