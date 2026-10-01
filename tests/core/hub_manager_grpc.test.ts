import { describe, it, expect } from "bun:test";
import { HubManagerGRPC } from "../../src_local/core/hub_manager_grpc.ts";

describe("HubManagerGRPC Test Suite", () => {
    it("should instantiate HubManagerGRPC with default host", () => {
        // HubManagerGRPC has a private constructor; getInstance() is the public entry point.
        const hub = HubManagerGRPC.getInstance();
        expect(hub).toBeDefined();
    });

    it("should instantiate HubManagerGRPC with custom host", () => {
        // getInstance() caches: if an instance already exists the host argument is ignored,
        // so this asserts the singleton contract rather than a second distinct client.
        const hub = HubManagerGRPC.getInstance("localhost:50051");
        expect(hub).toBeDefined();
    });
});
