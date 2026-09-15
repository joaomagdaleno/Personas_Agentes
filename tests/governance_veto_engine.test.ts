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

    describe("isTechnicalMath", () => {
        it("should return false if issue does not contain 'Imprecisão Monetária'", () => {
            // Arrange - Component: VetoEngine | Pattern: AAA
            const vetoEngine = new VetoEngine();

            // Act & Assert
            expect(vetoEngine.isTechnicalMath("const alpha = 0.5;", "Code Style Warning")).toBe(false);
        });

        it("should identify lines with technical mathematical terms when issue is 'Imprecisão Monetária'", () => {
            // Arrange - Component: VetoEngine | Pattern: AAA
            const vetoEngine = new VetoEngine();
            const issue = "Imprecisão Monetária";

            // Act & Assert
            expect(vetoEngine.isTechnicalMath("const alpha = 0.5;", issue)).toBe(true);
            expect(vetoEngine.isTechnicalMath("let velocity = calculateVelocity(radius);", issue)).toBe(true);
            expect(vetoEngine.isTechnicalMath("const progress = delta / duration;", issue)).toBe(true);
            expect(vetoEngine.isTechnicalMath("const x = 10;", issue)).toBe(true);
        });

        it("should return false if line contains monetary terms even if technical terms exist", () => {
            // Arrange - Component: VetoEngine | Pattern: AAA
            const vetoEngine = new VetoEngine();
            const issue = "Imprecisão Monetária";

            // Act & Assert
            expect(vetoEngine.isTechnicalMath("const price = amount * alpha;", issue)).toBe(false);
            expect(vetoEngine.isTechnicalMath("let total = cost + fee;", issue)).toBe(false);
            expect(vetoEngine.isTechnicalMath("const walletBalance = calculateBalance(x, y);", issue)).toBe(false);
        });
    });

    describe("isRuleDefinition", () => {
        it("should return true for lines matching rule definition keywords", () => {
            // Arrange - Component: VetoEngine | Pattern: AAA
            const vetoEngine = new VetoEngine();

            // Act & Assert
            expect(vetoEngine.isRuleDefinition("const rules = [ { id: 1 } ];")).toBe(true);
            expect(vetoEngine.isRuleDefinition("let audit_rules = getRules();")).toBe(true);
            expect(vetoEngine.isRuleDefinition("const heuristic = (a, b) => a - b;")).toBe(true);
            expect(vetoEngine.isRuleDefinition("const veto_criteria = ['infra', 'legacy'];")).toBe(true);
            expect(vetoEngine.isRuleDefinition("const security_policy = {};")).toBe(true);
            expect(vetoEngine.isRuleDefinition("const compliance_check = true;")).toBe(true);
            expect(vetoEngine.isRuleDefinition("const validation_logic = fn;")).toBe(true);
            expect(vetoEngine.isRuleDefinition("const rule_registry = [];")).toBe(true);
        });

        it("should return false for lines that do not match rule definition keywords", () => {
            // Arrange - Component: VetoEngine | Pattern: AAA
            const vetoEngine = new VetoEngine();

            // Act & Assert
            expect(vetoEngine.isRuleDefinition("const x = 42;")).toBe(false);
            expect(vetoEngine.isRuleDefinition("console.log('Hello World');")).toBe(false);
            expect(vetoEngine.isRuleDefinition("return true;")).toBe(false);
        });
    });
});
