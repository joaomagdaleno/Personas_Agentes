import { describe, it, expect } from "bun:test";
import { PsaEventBus } from "../src_local/psa/kernel/psa_events.ts";

describe("PsaEventBus Kernel Unit Tests", () => {
    it("should register listener, emit event, and purge key from Map when off() unregisters all handlers", async () => {
        const eventBus = new PsaEventBus();
        let receivedData = "";

        const handler = (data: string) => {
            receivedData = data;
        };

        // Subscribe
        const unsubscribe = eventBus.on("test:event", handler);
        await eventBus.emit("test:event", "hello_psa");
        expect(receivedData).toBe("hello_psa");

        // Access private listeners map for assertion
        const listenersMap = (eventBus as any).listeners as Map<string, any[]>;
        expect(listenersMap.has("test:event")).toBe(true);

        // Unsubscribe
        unsubscribe();

        // Verify key deletion from internal Map
        expect(listenersMap.has("test:event")).toBe(false);
    });
});
