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
        let handlers = this.listeners.get(event);
        if (!handlers) {
            handlers = [];
            this.listeners.set(event, handlers);
        }
        handlers.push(handler as PsaEventHandler);
        return () => this.off(event, handler as PsaEventHandler);
    }

    /**
     * Unsubscribes a listener function from the specified event name.
     */
    public off(event: string, handler: PsaEventHandler): void {
        const handlers = this.listeners.get(event);
        if (handlers) {
            const remaining = handlers.filter(h => h !== handler);
            if (remaining.length > 0) {
                this.listeners.set(event, remaining);
            } else {
                this.listeners.delete(event);
            }
        }
    }

    /**
     * Asynchronously emits an event payload to all registered listener functions.
     */
    public async emit<T = any>(event: string, data: T): Promise<void> {
        const handlers = this.listeners.get(event);
        // ⚡ Bolt Optimization: Early return for events without registered handlers (avoids empty array allocations & iteration overhead)
        if (!handlers || handlers.length === 0) return;

        // ⚡ Bolt Optimization: Avoid unnecessary promise wrapping/await for synchronous handlers
        for (let i = 0; i < handlers.length; i++) {
            try {
                const res = handlers[i](data);
                if (res && typeof (res as any).then === "function") {
                    await res;
                }
            } catch (err) {
                console.error(`❌ [PSA EventBus] Erro ao processar evento '${event}':`, err);
            }
        }
    }

    /**
     * Checks if any waterfall hooks are registered for the specified operation.
     */
    public hasWaterfall(hookName: string): boolean {
        const hooks = this.waterfalls.get(hookName);
        return Boolean(hooks && hooks.length > 0);
    }

    /**
     * Registers a waterfall middleware hook for intercepted operations.
     */
    public waterfall<T = any, R = any>(hookName: string, hook: PsaWaterfallHook<T, R>): void {
        let hooks = this.waterfalls.get(hookName);
        if (!hooks) {
            hooks = [];
            this.waterfalls.set(hookName, hooks);
        }
        hooks.push(hook);
    }

    /**
     * Runs the chain of waterfall middleware hooks sequentially before calling the final handler.
     */
    public async runWaterfall<T = any, R = any>(hookName: string, initialPayload: T, finalHandler: (payload: T) => Promise<R>): Promise<R> {
        // ⚡ Bolt Optimization: Avoid allocating an empty array fallback `[]` when no hooks are registered
        const hooks = this.waterfalls.get(hookName);
        if (!hooks || hooks.length === 0) {
            return await finalHandler(initialPayload);
        }

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
