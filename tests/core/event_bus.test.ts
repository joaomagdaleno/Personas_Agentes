import { describe, it, expect } from "bun:test";
import { EventBus, eventBus } from "../../src_local/core/event_bus.ts";

describe("EventBus Test Suite", () => {
    it("should instantiate EventBus correctly", () => {
        const bus = new EventBus();
        expect(bus).toBeDefined();
    });

    it("should emit and handle events registered on EventBus", () => {
        // Use a real key from SystemEventMap — "cache:updated" carries an empty payload.
        // The previous name "test_event" was not in the map and could not type-check.
        let called = false;
        const onCacheUpdated = () => { called = true; };
        eventBus.on("cache:updated", onCacheUpdated);
        try {
            eventBus.emit("cache:updated");
            expect(called).toBe(true);
        } finally {
            eventBus.off("cache:updated", onCacheUpdated);
        }
    });
});
