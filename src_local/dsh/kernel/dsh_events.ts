/**
 * 🐉 DSH Event Taxonomy & Waterfall Pipeline
 *
 * Baseado no modelo de eventos oficial do DeepSeek Harness:
 * - Session events (duráveis gravados no log)
 * - Agent events (ao vivo no loop)
 * - Tool waterfall hooks (pre-execute, execute, post-execute)
 */

export type DshEventHandler<T = any> = (payload: T) => void | Promise<void>;
export type DshWaterfallHandler<T = any, R = any> = (payload: T, next: () => Promise<R>) => Promise<R>;

export class DshEventBus {
    private listeners: Map<string, DshEventHandler[]> = new Map();
    private waterfalls: Map<string, DshWaterfallHandler[]> = new Map();

    /**
     * Assina um evento simples do barramento
     */
    public on<T = any>(event: string, handler: DshEventHandler<T>): void {
        const list = this.listeners.get(event) || [];
        list.push(handler);
        this.listeners.set(event, list);
    }

    /**
     * Emite um evento para todos os ouvintes
     */
    public async emit<T = any>(event: string, payload: T): Promise<void> {
        const list = this.listeners.get(event) || [];
        for (const handler of list) {
            await handler(payload);
        }
    }

    /**
     * Registra um hook em cascata (Waterfall) com capacidade de interceptação e chamada a next()
     */
    public waterfall<T = any, R = any>(event: string, handler: DshWaterfallHandler<T, R>): void {
        const list = this.waterfalls.get(event) || [];
        list.push(handler);
        this.waterfalls.set(event, list);
    }

    /**
     * Executa a cadeia de waterfalls em ordem, delegando através de next()
     */
    public async runWaterfall<T = any, R = any>(event: string, payload: T, defaultAction: () => Promise<R>): Promise<R> {
        const chain = this.waterfalls.get(event) || [];
        if (chain.length === 0) {
            return await defaultAction();
        }

        let index = 0;
        const next = async (): Promise<R> => {
            if (index < chain.length) {
                const handler = chain[index++];
                return await handler(payload, next);
            }
            return await defaultAction();
        };

        return await next();
    }
}
