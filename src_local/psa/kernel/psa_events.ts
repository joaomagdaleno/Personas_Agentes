/**
 * Event handler callback signature for PSA EventBus events.
 */
export type PsaEventHandler<T = any> = (data: T) => void | Promise<void>;

/**
 * Waterfall hook middleware signature for request interception and security checks.
 */
export type PsaWaterfallHook<T = any, R = any> = (payload: T, next: () => Promise<R>) => Promise<R>;

/**
 * 📡 PSA Kernel Event Bus — Asynchronous Event & Waterfall Pipeline.
 * Manages event subscription, asynchronous emission, and middleware waterfall hooks.
 */
export class PsaEventBus {
    private listeners: Map<string, PsaEventHandler[]> = new Map();
    private waterfalls: Map<string, PsaWaterfallHook[]> = new Map();

    /**
     * Subscribes a listener function to the specified event name.
     * @returns An unsubscribe function that removes the listener.
     */
    public on<T = any>(event: string, handler: PsaEventHandler<T>): () => void {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event)!.push(handler);
        return () => this.off(event, handler);
    }

    /**
     * Unsubscribes a listener function from the specified event name.
     */
    public off(event: string, handler: PsaEventHandler): void {
        const handlers = this.listeners.get(event);
        if (handlers) {
            this.listeners.set(event, handlers.filter(h => h !== handler));
        }
    }

    /**
     * Asynchronously emits an event payload to all registered listener functions.
     */
    public async emit<T = any>(event: string, data: T): Promise<void> {
        const handlers = this.listeners.get(event) || [];
        for (const handler of handlers) {
            try {
                await handler(data);
            } catch (err) {
                console.error(`❌ [PSA EventBus] Erro ao processar evento '${event}':`, err);
            }
        }
    }

    /**
     * Registers a waterfall middleware hook for intercepted operations.
     */
    public waterfall<T = any, R = any>(hookName: string, hook: PsaWaterfallHook<T, R>): void {
        if (!this.waterfalls.has(hookName)) {
            this.waterfalls.set(hookName, []);
        }
        this.waterfalls.get(hookName)!.push(hook);
    }

    /**
     * Runs the chain of waterfall middleware hooks sequentially before calling the final handler.
     */
    public async runWaterfall<T = any, R = any>(hookName: string, initialPayload: T, finalHandler: (payload: T) => Promise<R>): Promise<R> {
        const hooks = this.waterfalls.get(hookName) || [];
        let index = 0;

        const dispatch = async (currentPayload: T): Promise<R> => {
            if (index < hooks.length) {
                const currentHook = hooks[index++];
                return await currentHook(currentPayload, () => dispatch(currentPayload));
            }
            return await finalHandler(currentPayload);
        };

        return await dispatch(initialPayload);
    }
}

// Compatibilidade
export { PsaEventBus as DshEventBus };
