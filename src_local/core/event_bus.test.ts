import { describe, it, expect } from "bun:test";
import { EventBus, eventBus } from "./event_bus.ts";

describe("EventBus Test Suite", () => {
    it("should instantiate EventBus correctly", () => {
        const bus = new EventBus();
        expect(bus).toBeDefined();
    });

    it("should emit and handle events registered on EventBus", () => {
        let called = false;
        eventBus.on("test_event", () => { called = true; });
        eventBus.emit("test_event", { payload: 123 });
        expect(called).toBe(true);
    });
});
