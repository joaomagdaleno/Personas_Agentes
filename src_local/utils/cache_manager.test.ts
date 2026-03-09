
import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import { CacheManager } from './cache_manager.ts';
import { Path } from '../core/path_utils.ts';
import { rmSync, existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('CacheManager', () => {
    const testRoot = join(process.cwd(), 'tmp_test_cache');
    let cacheManager: CacheManager;

    beforeEach(() => {
        if (!existsSync(testRoot)) {
            // Path constructor handles directory creation if we were using it in Orchestrator,
            // but here we just need a string for CacheManager constructor.
        }
        cacheManager = new CacheManager(testRoot);
    });

    afterEach(() => {
        if (existsSync(testRoot)) {
            rmSync(testRoot, { recursive: true, force: true });
        }
    });

    it('should initialize with empty cache if file does not exist', () => {
        expect(cacheManager.currentCache).toEqual({});
    });

    it('should detect changes correctly', () => {
        cacheManager.update('file1.ts', 'hash1');
        expect(cacheManager.isChanged('file1.ts', 'hash1')).toBe(false);
        expect(cacheManager.isChanged('file1.ts', 'hash2')).toBe(true);
        expect(cacheManager.isChanged('newfile.ts', 'hash1')).toBe(true);
    });

    it('should update and save cache to disk', () => {
        cacheManager.update('test.ts', 'abc123');
        cacheManager.save();

        const cacheFilePath = join(testRoot, '.gemini', 'cache', 'audit_cache.json');
        expect(existsSync(cacheFilePath)).toBe(true);

        const content = JSON.parse(readFileSync(cacheFilePath, 'utf-8'));
        expect(content['test.ts']).toBe('abc123');
    });

    it('should get file hash correctly', async () => {
        // Create a dummy file
        const dummyPath = join(testRoot, 'dummy.txt');
        const fs = require('node:fs');
        fs.mkdirSync(testRoot, { recursive: true });
        fs.writeFileSync(dummyPath, 'pericope');

        const hash = await cacheManager.getFileHash(dummyPath);
        expect(hash).toBeDefined();
        expect(hash.length).toBeGreaterThan(0);

        const hash2 = await cacheManager.getFileHash(dummyPath);
        expect(hash).toBe(hash2);
    });
});
