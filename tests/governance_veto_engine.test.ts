import { describe, it, expect } from "bun:test";
import { VetoEngine } from "../src_local/core/governance/veto_engine.ts";
import { VetoReason } from "../src_local/core/governance/policy_definitions.ts";

describe("VetoEngine Governance Unit Tests", () => {
    it("should veto infrastructure paths like node_modules or .git", () => {
        // Arrange - Component: VetoEngine | Pattern: AAA
        const vetoEngine = new VetoEngine();

        // Act
        const gitResult = vetoEngine.shouldVeto(".git/config");
        const nodeResult = vetoEngine.shouldVeto("src/node_modules/package/index.js");

        // Assert
        expect(gitResult.veto).toBe(true);
        expect(gitResult.reason).toBe(VetoReason.INFRASTRUCTURE);

        expect(nodeResult.veto).toBe(true);
        expect(nodeResult.reason).toBe(VetoReason.INFRASTRUCTURE);
    });

    it("should veto legacy compiled artifacts or binary extensions", () => {
        // Arrange - Component: VetoEngine | Pattern: AAA
        const vetoEngine = new VetoEngine();

        // Act
        const pycResult = vetoEngine.shouldVeto("src/module.pyc");
        const dllResult = vetoEngine.shouldVeto("src/library.dll");

        // Assert
        expect(pycResult.veto).toBe(true);
        expect(pycResult.reason).toBe(VetoReason.LEGACY_ARTIFACT);

        expect(dllResult.veto).toBe(true);
        expect(dllResult.reason).toBe(VetoReason.LEGACY_ARTIFACT);
    });

    it("should veto protected security paths containing secrets or internal keys", () => {
        // Arrange - Component: VetoEngine | Pattern: AAA
        const vetoEngine = new VetoEngine();

        // Act
        const secretResult = vetoEngine.shouldVeto("app/secrets/api_key.json");
        const keyResult = vetoEngine.shouldVeto("app/internal/keys/private.pem");

        // Assert
        expect(secretResult.veto).toBe(true);
        expect(secretResult.reason).toBe(VetoReason.SECURITY_RISK);

        expect(keyResult.veto).toBe(true);
        expect(keyResult.reason).toBe(VetoReason.SECURITY_RISK);
    });

    it("should allow safe standard code source files", () => {
        // Arrange - Component: VetoEngine | Pattern: AAA
        const vetoEngine = new VetoEngine();

        // Act
        const tsResult = vetoEngine.shouldVeto("src_local/core/orchestrator.ts");

        // Assert
        expect(tsResult.veto).toBe(false);
        expect(tsResult.reason).toBeUndefined();
    });

    it("should correctly classify technical math expressions vs financial terms in isTechnicalMath", () => {
        // Arrange - Component: VetoEngine | Pattern: AAA
        const vetoEngine = new VetoEngine();
        const monetaryIssue = "Imprecisão Monetária no cálculo";
        const otherIssue = "Outro tipo de problema";

        // Act & Assert - Non-monetary issue type should return false
        expect(vetoEngine.isTechnicalMath("const alpha = 0.5;", otherIssue)).toBe(false);

        // Act & Assert - Technical math terms should return true for monetary issue type
        expect(vetoEngine.isTechnicalMath("const alpha = delta * velocity;", monetaryIssue)).toBe(true);
        expect(vetoEngine.isTechnicalMath("let phase = 180;", monetaryIssue)).toBe(true);

        // Act & Assert - Lines with financial/money terms should return false even with math terms
        expect(vetoEngine.isTechnicalMath("const totalBalance = price * delta;", monetaryIssue)).toBe(false);
        expect(vetoEngine.isTechnicalMath("let amount = usd + euro;", monetaryIssue)).toBe(false);

        // Act & Assert - Plain non-technical non-financial lines should return false
        expect(vetoEngine.isTechnicalMath("const greeting = 'hello world';", monetaryIssue)).toBe(false);
    });

    it("should detect rule definitions in source code lines via isRuleDefinition", () => {
        // Arrange - Component: VetoEngine | Pattern: AAA
        const vetoEngine = new VetoEngine();

        // Act & Assert - Lines with rule keywords should return true
        expect(vetoEngine.isRuleDefinition("const rules = [rule1, rule2];")).toBe(true);
        expect(vetoEngine.isRuleDefinition("let audit_rules = getRules();")).toBe(true);
        expect(vetoEngine.isRuleDefinition("const regex = /^[a-z]+$/;")).toBe(true);
        expect(vetoEngine.isRuleDefinition("const heuristic = 'fast_path';")).toBe(true);

        // Act & Assert - Standard code lines without rule keywords should return false
        expect(vetoEngine.isRuleDefinition("function calculateSum(a, b) { return a + b; }")).toBe(false);
        expect(vetoEngine.isRuleDefinition("console.log('processing request');")).toBe(false);
    });
});
