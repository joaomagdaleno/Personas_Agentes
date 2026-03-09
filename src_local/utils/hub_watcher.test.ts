
import { describe, it, expect, beforeEach, mock } from 'bun:test';
import { HubWatcher } from './hub_watcher.ts';

describe('HubWatcher', () => {
    let watcher: HubWatcher;
    let mockManager: any;

    beforeEach(() => {
        mockManager = {
            watchEvents: mock((cb: any) => ({})),
            watchHealth: mock((cb: any) => ({})),
        };
        watcher = new HubWatcher('localhost:0', mockManager);
        watcher.start();
    });

    it('should notify on file events', () => {
        const spy = mock(() => { });
        watcher.onChange(spy);

        // Simulate event via manager
        const eventCallback = mockManager.watchEvents.mock.calls[0][0];
        eventCallback({ type: 'FILE_EVENT', path: 'src/app.ts' });

        expect(spy).toHaveBeenCalledWith('src/app.ts');
    });

    it('should filter internal files', () => {
        const spy = mock(() => { });
        watcher.onChange(spy);

        const eventCallback = mockManager.watchEvents.mock.calls[0][0];
        eventCallback({ type: 'FILE_EVENT', path: '.git/config' });

        expect(spy).not.toHaveBeenCalled();
    });
});
