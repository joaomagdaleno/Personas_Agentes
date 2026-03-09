
import { describe, it, expect, beforeEach, mock } from 'bun:test';
import { TaskQueue } from './task_queue.ts';

describe('TaskQueue', () => {
    let taskQueue: TaskQueue;
    let mockHubManager: any;

    beforeEach(() => {
        mockHubManager = {
            enqueueTask: mock(async () => true),
            getPendingTasks: mock(async () => ({ response: { tasks: [{ id: 1, type: 'TEST' }] } })),
            updateTask: mock(async () => { })
        };
        taskQueue = new TaskQueue('mock-root', mockHubManager);
    });

    it('should enqueue tasks via hubManager', async () => {
        const success = await taskQueue.enqueue('CLEAN', 'file.ts');
        expect(success).toBe(true);
        expect(mockHubManager.enqueueTask).toHaveBeenCalled();
    });

    it('should retrieve pending tasks', async () => {
        try {
            const tasks = await taskQueue.getPendingTasks(1);
            expect(tasks.length).toBe(1);
            expect(tasks[0].id).toBe(1);
        } catch (e) {
            console.error('Test "should retrieve pending tasks" failed:', e);
            throw e;
        }
    });

    it('should update task status', async () => {
        try {
            await taskQueue.updateTaskStatus(123, 'DONE', 'Success');
            expect(mockHubManager.updateTask).toHaveBeenCalledWith(123, 'DONE', 'Success');
        } catch (e) {
            console.error('Test "should update task status" failed:', e);
            throw e;
        }
    });
});
