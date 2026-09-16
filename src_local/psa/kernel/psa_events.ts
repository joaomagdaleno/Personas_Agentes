export type PsaEventHandler<T = any> = (data: T) => void | Promise<void>;
export type PsaWaterfallHook<T = any, R = any> = (payload: T, next: () => Promise<R>) => Promise<R>;

export class PsaEventBus {
    private listeners: Map<string, PsaEventHandler[]> = new Map();
    private waterfalls: Map<string, PsaWaterfallHook[]> = new Map();

    public on<T = any>(event: string, handler: PsaEventHandler<T>): () => void {
        let handlers = this.listeners.get(event);
        if (!handlers) {
            handlers = [];
            this.listeners.set(event, handlers);
        }
        handlers.push(handler as PsaEventHandler);
        return () => this.off(event, handler as PsaEventHandler);
    }

    public off(event: string, handler: PsaEventHandler): void {
        const handlers = this.listeners.get(event);
        if (!handlers) return;

        const filtered = handlers.filter(h => h !== handler);
        if (filtered.length > 0) {
            this.listeners.set(event, filtered);
        } else {
            this.listeners.delete(event);
        }
    }

    public async emit<T = any>(event: string, data: T): Promise<void> {
        const handlers = this.listeners.get(event);
        if (!handlers || handlers.length === 0) return;

        for (const handler of handlers) {
            try {
                await handler(data);
            } catch (err) {
                console.error(`❌ [PSA EventBus] Erro ao processar evento '${event}':`, err);
            }
        }
    }

    public waterfall<T = any, R = any>(hookName: string, hook: PsaWaterfallHook<T, R>): void {
        let hooks = this.waterfalls.get(hookName);
        if (!hooks) {
            hooks = [];
            this.waterfalls.set(hookName, hooks);
        }
        hooks.push(hook);
    }

    public async runWaterfall<T = any, R = any>(hookName: string, initialPayload: T, finalHandler: (payload: T) => Promise<R>): Promise<R> {
        const hooks = this.waterfalls.get(hookName) || [];
        if (hooks.length === 0) {
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
