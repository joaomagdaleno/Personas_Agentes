import { describe, it, expect } from "bun:test";
import {
    SyncDevopsArchitectService,
    GitClient,
    DocGenAgent,
    TestArchitectAgent,
    ValidationAgent
} from "./sync_devops_architect_service.ts";

describe("SyncDevopsArchitectService Deep Test Suite", () => {
    it("should instantiate SyncDevopsArchitectService correctly", () => {
        const service = new SyncDevopsArchitectService();
        expect(service).toBeDefined();
    });

    it("should instantiate GitClient with project root", () => {
        const git = new GitClient(process.cwd());
        expect(git).toBeDefined();
    });

    it("should re-export legacy agent aliases correctly", () => {
        expect(DocGenAgent).toBeDefined();
        expect(TestArchitectAgent).toBeDefined();
        expect(ValidationAgent).toBeDefined();
    });
});
