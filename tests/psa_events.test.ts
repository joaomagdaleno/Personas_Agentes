import { describe, it, expect, mock } from "bun:test";
import { PsaEventBus } from "../src_local/psa/kernel/psa_events.ts";

describe("PsaEventBus Kernel Unit Tests", () => {
    it("should register and emit events correctly", async () => {
        const bus = new PsaEventBus();
        const handler = mock();

        bus.on("test_event", handler);
        await bus.emit("test_event", { foo: "bar" });

        expect(handler).toHaveBeenCalledTimes(1);
        expect(handler).toHaveBeenCalledWith({ foo: "bar" });
    });

    it("should unsubscribe handlers and prune empty listener map entry", async () => {
        const bus = new PsaEventBus();
        const handler = mock();

        const unsubscribe = bus.on("test_event", handler);
        unsubscribe();

        await bus.emit("test_event", { foo: "bar" });
        expect(handler).toHaveBeenCalledTimes(0);
    });

    it("should execute waterfall hooks sequentially", async () => {
        const bus = new PsaEventBus();

        bus.waterfall("transform", async (payload: { count: number }, next) => {
            payload.count += 1;
            return await next();
        });

        const result = await bus.runWaterfall("transform", { count: 10 }, async (p) => {
            return p.count * 2;
        });

        expect(result).toBe(22);
    });
});
