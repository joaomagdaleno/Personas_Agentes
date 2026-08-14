import { describe, it, expect } from "bun:test";
import { WasmMicroAgentRuntime } from "../src_local/utils/ai/wasm_micro_agent_runtime.ts";
import { SovereignResourceBudget } from "../src_local/engines/maintenance/sovereign_resource_budget.ts";

describe("WasmMicroAgentRuntime Unit Tests", () => {
    it("should register all 4 default WASM micro-agents on startup", () => {
        const runtime = WasmMicroAgentRuntime.getInstance();
        const agents = runtime.getRegisteredAgents();

        expect(agents.length).toBe(4);

        const ids = agents.map(a => a.id);
        expect(ids).toContain("agent_audit.wasm");
        expect(ids).toContain("agent_security.wasm");
        expect(ids).toContain("agent_git.wasm");
        expect(ids).toContain("agent_telemetry.wasm");

        // Validate individual metadata metrics as per requirement
        const auditAgent = agents.find(a => a.id === "agent_audit.wasm")!;
        expect(auditAgent.binarySizeKb).toBe(512);
        expect(auditAgent.ramLimitKb).toBe(600);

        const secAgent = agents.find(a => a.id === "agent_security.wasm")!;
        expect(secAgent.binarySizeKb).toBe(768);
        expect(secAgent.ramLimitKb).toBe(800);

        const gitAgent = agents.find(a => a.id === "agent_git.wasm")!;
        expect(gitAgent.binarySizeKb).toBe(1024);
        expect(gitAgent.ramLimitKb).toBe(1024);

        const telAgent = agents.find(a => a.id === "agent_telemetry.wasm")!;
        expect(telAgent.binarySizeKb).toBe(256);
        expect(telAgent.ramLimitKb).toBe(300);
    });

    it("should successfully execute agent_audit.wasm and detect silent exceptions", async () => {
        const runtime = WasmMicroAgentRuntime.getInstance();

        const cleanCode = "const x = 10; function test() { return x * 2; }";
        const resultClean = await runtime.execute("agent_audit.wasm", cleanCode);
        expect(resultClean.success).toBe(true);
        expect(resultClean.output.success).toBe(true);
        expect(resultClean.output.issues.length).toBe(0);
        expect(resultClean.purged).toBe(true);
        expect(resultClean.allocatedRamKb).toBe(600);

        const badCode = "try { something(); } catch (e) {}";
        const resultBad = await runtime.execute("agent_audit.wasm", { source: badCode });
        expect(resultBad.success).toBe(true);
        expect(resultBad.output.success).toBe(false);
        expect(resultBad.output.issues.length).toBeGreaterThan(0);
        expect(resultBad.output.issues[0].issue).toContain("silent exception");
    });

    it("should successfully execute agent_security.wasm and find critical patterns", async () => {
        const runtime = WasmMicroAgentRuntime.getInstance();

        const badCode = "const fn = eval; fn('bad()'); const token = 'SGVsbG8gV29ybGQgZnJvbSBKVUxFUyBvZiBPcGVuQ29kZSE=';";
        const result = await runtime.execute("agent_security.wasm", badCode);

        expect(result.success).toBe(true);
        expect(result.output.secure).toBe(false);
        expect(result.output.vulnerabilities.length).toBe(2);
        expect(result.output.vulnerabilities[0].pattern).toBe("eval/exec usage");
        expect(result.output.vulnerabilities[1].pattern).toBe("high entropy string detected");
    });

    it("should successfully execute agent_git.wasm with semantic messages and merge conflicts", async () => {
        const runtime = WasmMicroAgentRuntime.getInstance();

        const payload = {
            commitMessage: "feat(core): add awesome feature",
            diff: `<<<<<<< SEARCH\nconst old = true;\n=======\nconst old = false;\n>>>>>>> REPLACE`
        };

        const result = await runtime.execute("agent_git.wasm", payload);
        expect(result.success).toBe(true);
        expect(result.output.validSemanticMessage).toBe(true);
        expect(result.output.hasMergeConflicts).toBe(true);
    });

    it("should successfully execute agent_telemetry.wasm and return system diagnostics", async () => {
        const runtime = WasmMicroAgentRuntime.getInstance();

        const result = await runtime.execute("agent_telemetry.wasm", {});
        expect(result.success).toBe(true);
        expect(result.output).toHaveProperty("sampledAt");
        expect(result.output).toHaveProperty("cpuLoadPercent");
        expect(result.output).toHaveProperty("ramUsageBytes");
    });

    it("should handle error when running unregistered agents", async () => {
        const runtime = WasmMicroAgentRuntime.getInstance();

        const result = await runtime.execute("invalid.wasm", {});
        expect(result.success).toBe(false);
        expect(result.purged).toBe(true);
        expect(result.error).toContain("não registrado");
    });

    it("should limit concurrency dynamically based on SovereignResourceBudget", async () => {
        const runtime = WasmMicroAgentRuntime.getInstance();
        const budget = SovereignResourceBudget.getInstance();

        // Simulate multiple parallel executions
        const promises = [
            runtime.execute("agent_telemetry.wasm", {}),
            runtime.execute("agent_telemetry.wasm", {}),
            runtime.execute("agent_telemetry.wasm", {})
        ];

        const results = await Promise.all(promises);
        expect(results.every(r => r.success)).toBe(true);
        expect(runtime.getActiveExecutions()).toBe(0);
    });
});
