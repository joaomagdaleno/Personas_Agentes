import { describe, it, expect, afterEach } from "bun:test";
import { SentinelDaemon } from "../src_local/core/sentinel_daemon.ts";
import { TaskWorkerPool } from "../src_local/core/task_worker_pool.ts";

describe("SentinelDaemon & WorkerPool Test Suite", () => {
    let sentinel: SentinelDaemon | null = null;

    afterEach(() => {
        if (sentinel) {
            sentinel.stop();
            sentinel = null;
        }
    });

    it("should instantiate and start TaskWorkerPool correctly", () => {
        const pool = new TaskWorkerPool(2);
        expect(pool).toBeDefined();
        const status = pool.getStatus();
        expect(status.queueLength).toBe(0);
        expect(status.activeWorkers).toBe(0);
    });

    it("should process enqueued tasks in TaskWorkerPool", async () => {
        const pool = new TaskWorkerPool(2);
        pool.start();

        let processed = false;
        pool.enqueue({
            id: "test_task_1",
            type: "test",
            payload: {},
            priority: "NORMAL"
        });

        await new Promise(resolve => setTimeout(resolve, 150));
        expect(pool.getStatus().queueLength).toBe(0);
        pool.stop();
    });

    it("should instantiate and manage SentinelDaemon life cycle", () => {
        sentinel = new SentinelDaemon(process.cwd(), 2);
        expect(sentinel).toBeDefined();
        
        sentinel.start();
        const status = sentinel.getStatus();
        expect(status.isRunning).toBe(true);
        
        sentinel.stop();
        expect(sentinel.getStatus().isRunning).toBe(false);
    });
});
