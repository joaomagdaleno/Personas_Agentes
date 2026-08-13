import { describe, it, expect } from "bun:test";
import {
    ArchitectureTypesService,
    ComponentClassifier,
    ParityReporter
} from "./architecture_types_service.ts";

describe("ArchitectureTypesService Deep Test Suite", () => {
    it("should instantiate ArchitectureTypesService correctly", () => {
        const service = new ArchitectureTypesService();
        expect(service).toBeDefined();
    });

    it("should correctly classify file topology components", () => {
        const classifier = new ComponentClassifier();
        expect(classifier.mapType("src_local/core/orchestrator.ts")).toBe("CORE");
        expect(classifier.mapType("tests/unit.test.ts")).toBe("TEST");
        expect(classifier.mapType("src_local/utils/helper.ts")).toBe("UTIL");
    });

    it("should format markdown parity report correctly", () => {
        const mockReport = {
            overallParity: 98.5,
            totalAgents: 10,
            totalInstances: 5,
            symmetricCount: 4,
            divergentCount: 1,
            coverage: []
        };
        const md = ParityReporter.formatMarkdown(mockReport);
        expect(md).toContain("98.5%");
        expect(md).toContain("SINCRO-NATIVA");
    });
});
