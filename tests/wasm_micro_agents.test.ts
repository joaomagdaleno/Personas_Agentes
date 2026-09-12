import { describe, it, expect } from "bun:test";
import { WasmMicroAgentRuntime } from "../src_local/utils/ai/wasm_micro_agent_runtime.ts";
import { SovereignResourceBudget } from "../src_local/engines/maintenance/sovereign_resource_budget.ts";

describe("WasmMicroAgentRuntime Unit Tests", () => {
    it("should register all default WASM micro-agents on startup", () => {
        const runtime = WasmMicroAgentRuntime.getInstance();
        const agents = runtime.getRegisteredAgents();

        expect(agents.length).toBeGreaterThanOrEqual(6);

        const ids = agents.map(a => a.id);
        expect(ids).toContain("agent_audit.wasm");
        expect(ids).toContain("agent_security.wasm");
        expect(ids).toContain("agent_git.wasm");
        expect(ids).toContain("agent_telemetry.wasm");
        expect(ids).toContain("agent_database.wasm");
        expect(ids).toContain("agent_linter.wasm");

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

    it("should successfully execute agent_database.wasm and detect unbounded queries", async () => {
        const runtime = WasmMicroAgentRuntime.getInstance();
        const unsafeRes = await runtime.execute("agent_database.wasm", { sql: "DELETE FROM users" });
        expect(unsafeRes.success).toBe(true);
        expect(unsafeRes.output.safe).toBe(false);

        const safeRes = await runtime.execute("agent_database.wasm", { sql: "SELECT * FROM users WHERE id = 1" });
        expect(safeRes.success).toBe(true);
        expect(safeRes.output.safe).toBe(true);
    });

    it("should successfully execute agent_linter.wasm and detect code smells", async () => {
        const runtime = WasmMicroAgentRuntime.getInstance();
        const lintRes = await runtime.execute("agent_linter.wasm", "var x = 10; console.log(x);");
        expect(lintRes.success).toBe(true);
        expect(lintRes.output.clean).toBe(false);
        expect(lintRes.output.warnings.length).toBe(2);
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

    it("should purge all WASI sandbox allocations and reset active executions to zero", () => {
        // Arrange - Component: WasmMicroAgentRuntime | Pattern: Given-When-Then
        const runtime = WasmMicroAgentRuntime.getInstance();

        // Simulate active WASI sandbox executions
        (runtime as any).activeExecutions = 3;
        expect(runtime.getActiveExecutions()).toBe(3);

        // Act
        const purgeResult = runtime.purgeAll();

        // Assert
        expect(purgeResult).toBe(true);
        expect(runtime.getActiveExecutions()).toBe(0);
    });

    it("should detect destructive DDL statements (DROP TABLE / TRUNCATE) in agent_database.wasm", async () => {
        // Arrange - Component: WasmMicroAgentRuntime (agent_database.wasm) | Pattern: AAA
        const runtime = WasmMicroAgentRuntime.getInstance();

        // Act
        const resultDrop = await runtime.execute("agent_database.wasm", { sql: "DROP TABLE users;" });
        const resultTruncate = await runtime.execute("agent_database.wasm", { sql: "TRUNCATE TABLE logs;" });

        // Assert
        expect(resultDrop.success).toBe(true);
        expect(resultDrop.output.safe).toBe(false);
        expect(resultDrop.output.issues.some((i: any) => i.message.includes("Destructive DDL"))).toBe(true);

        expect(resultTruncate.success).toBe(true);
        expect(resultTruncate.output.safe).toBe(false);
        expect(resultTruncate.output.issues.some((i: any) => i.message.includes("Destructive DDL"))).toBe(true);
    });

    it("should detect TODO placeholders in agent_audit.wasm", async () => {
        // Arrange - Component: WasmMicroAgentRuntime (agent_audit.wasm) | Pattern: AAA
        const runtime = WasmMicroAgentRuntime.getInstance();

        // Act
        const result = await runtime.execute("agent_audit.wasm", "function processData() { // TODO: implement later\n }");

        // Assert
        expect(result.success).toBe(true);
        expect(result.output.success).toBe(false);
        expect(result.output.issues.some((i: any) => i.issue.includes("TODO placeholder"))).toBe(true);
    });

    it("should pass clean code as secure without vulnerabilities in agent_security.wasm", async () => {
        // Arrange - Component: WasmMicroAgentRuntime (agent_security.wasm) | Pattern: AAA
        const runtime = WasmMicroAgentRuntime.getInstance();
        const safeCode = "const calculateSum = (a: number, b: number) => a + b;";

        // Act
        const result = await runtime.execute("agent_security.wasm", safeCode);

        // Assert
        expect(result.success).toBe(true);
        expect(result.output.secure).toBe(true);
        expect(result.output.vulnerabilities.length).toBe(0);
    });

    it("should flag non-semantic commit messages in agent_git.wasm", async () => {
        // Arrange - Component: WasmMicroAgentRuntime (agent_git.wasm) | Pattern: AAA
        const runtime = WasmMicroAgentRuntime.getInstance();
        const payload = {
            commitMessage: "fixed stuff and updated code",
            diff: "const a = 1;"
        };

        // Act
        const result = await runtime.execute("agent_git.wasm", payload);

        // Assert
        expect(result.success).toBe(true);
        expect(result.output.validSemanticMessage).toBe(false);
        expect(result.output.hasMergeConflicts).toBe(false);
    });

    it("should allow dynamic registration and execution of custom WASM agents with fallback logic", async () => {
        // Arrange - Component: WasmMicroAgentRuntime (Custom Agent Registration) | Pattern: AAA
        const runtime = WasmMicroAgentRuntime.getInstance();
        const customAgent = {
            id: "agent_custom_test.wasm",
            name: "Custom Test Agent",
            binarySizeKb: 128,
            ramLimitKb: 256,
            expectedExecTimeMs: 1,
            category: "Testing",
            capabilities: ["custom_test_probing"]
        };

        // Act
        runtime.registerAgent(customAgent);
        const registered = runtime.getRegisteredAgents();
        const execResult = await runtime.execute("agent_custom_test.wasm", { payload: "test" });

        // Assert
        expect(registered.some(a => a.id === "agent_custom_test.wasm")).toBe(true);
        expect(execResult.success).toBe(true);
        expect(execResult.output).toEqual({ status: "OK" });
        expect(execResult.purged).toBe(true);
    });
});
