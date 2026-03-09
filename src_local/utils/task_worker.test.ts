
import { describe, it, expect, beforeEach, mock } from 'bun:test';
import { TaskWorker } from './task_worker.ts';

describe('TaskWorker', () => {
    let worker: TaskWorker;
    let mockQueue: any;

    beforeEach(() => {
        mockQueue = {
            getPendingTasks: mock(async () => []),
            updateTaskStatus: mock(async () => { }),
        };
        worker = new TaskWorker(mockQueue);
    });

    it('should process documentation tasks', async () => {
        mockQueue.getPendingTasks.mockResolvedValueOnce([{ id: 1, task_type: 'DOC_GEN', target_file: 'test.ts' }]);

        // We need to run processTask which is private, but we can test it via start() with a stop
        // Or just cast to any for unit testing private methods
        await (worker as any).processTask({ id: 1, task_type: 'DOC_GEN', target_file: 'test.ts' });

        expect(mockQueue.updateTaskStatus).toHaveBeenCalledWith(1, 'RUNNING');
        expect(mockQueue.updateTaskStatus).toHaveBeenCalledWith(1, 'COMPLETED', 'Success');
    });
});
