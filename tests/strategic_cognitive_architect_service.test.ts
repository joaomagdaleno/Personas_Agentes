import { describe, it, expect } from "bun:test";
import {
    StrategicCognitiveArchitectService,
    ActivityClassifier,
    CognitiveEngine
} from "../src_local/engines/strategic/strategic_cognitive_architect_service.ts";

describe("StrategicCognitiveArchitectService Deep Test Suite", () => {
    it("should instantiate StrategicCognitiveArchitectService correctly", () => {
        const service = new StrategicCognitiveArchitectService();
        expect(service).toBeDefined();
    });

    it("should classify application activity categories correctly", () => {
        expect(ActivityClassifier.classify("code", "VS Code - main.ts")).toBe("DEV");
        expect(ActivityClassifier.classify("powershell", "Terminal")).toBe("DEV");
        expect(ActivityClassifier.classify("chrome", "YouTube - Video")).toBe("MEDIA");
        expect(ActivityClassifier.classify("chrome", "Google Search")).toBe("BROWSING");
        expect(ActivityClassifier.classify("steam", "Game Launcher")).toBe("GAMING");
        expect(ActivityClassifier.classify("calculator", "Calc")).toBe("GENERAL");
    });

    it("should obtain singleton instance of CognitiveEngine", () => {
        const engine1 = CognitiveEngine.getInstance();
        const engine2 = CognitiveEngine.getInstance();
        expect(engine1).toBe(engine2);
    });
});
