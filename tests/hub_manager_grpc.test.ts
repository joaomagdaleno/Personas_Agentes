import { describe, it, expect } from "bun:test";
import { HubManagerGRPC } from "../src_local/core/hub_manager_grpc.ts";

describe("HubManagerGRPC Test Suite", () => {
    it("should instantiate HubManagerGRPC with default host", () => {
        const hub = new HubManagerGRPC();
        expect(hub).toBeDefined();
    });

    it("should instantiate HubManagerGRPC with custom host", () => {
        const hub = new HubManagerGRPC("localhost:50051");
        expect(hub).toBeDefined();
    });
});
