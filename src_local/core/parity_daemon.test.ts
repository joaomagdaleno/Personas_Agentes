import { describe, it, expect } from "bun:test";
import { ParityDaemon } from "./parity_daemon.ts";
import { HubWatcher } from "../engines/automation/sync_devops_architect_service.ts";
import { StabilityLedger } from "../engines/healing/resilience_healing_architect_service.ts";
import { HubManagerGRPC } from "./hub_manager_grpc.ts";

describe("ParityDaemon Test Suite", () => {
    it("should instantiate ParityDaemon with its required collaborators", () => {
        // ParityDaemon requires (projectRoot, watcher, ledger, hubManager).
        // Construction has no side effects — start() is deliberately NOT called here,
        // so this test does not spawn the watcher nor write the stability ledger.
        const projectRoot = process.cwd();
        const daemon = new ParityDaemon(
            projectRoot,
            new HubWatcher(undefined, HubManagerGRPC.getInstance()),
            new StabilityLedger(projectRoot),
            HubManagerGRPC.getInstance()
        );

        expect(daemon).toBeDefined();
    });
});
