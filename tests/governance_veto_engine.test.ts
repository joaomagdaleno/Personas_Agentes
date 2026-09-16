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
        it("should return false if issue description does not contain 'Imprecisão Monetária'", () => {
            // Arrange - Component: VetoEngine | Pattern: AAA
            const vetoEngine = new VetoEngine();

            // Act & Assert
            expect(vetoEngine.isTechnicalMath("const offset = alpha + beta;", "Outro Tipo de Issue")).toBe(false);
        });

        it("should return false if line contains financial/monetary terms even with technical terms", () => {
            // Arrange - Component: VetoEngine | Pattern: AAA
            const vetoEngine = new VetoEngine();

            // Act & Assert
            expect(vetoEngine.isTechnicalMath("const totalBalance = amount * price;", "Imprecisão Monetária")).toBe(false);
            expect(vetoEngine.isTechnicalMath("let walletCost = calculateWalletCost(usd);", "Imprecisão Monetária")).toBe(false);
        });

        it("should return true if issue is 'Imprecisão Monetária' and line contains technical math terms without money terms", () => {
            // Arrange - Component: VetoEngine | Pattern: AAA
            const vetoEngine = new VetoEngine();

            // Act & Assert
            expect(vetoEngine.isTechnicalMath("const velocity = alpha * radius + offset;", "Imprecisão Monetária")).toBe(true);
            expect(vetoEngine.isTechnicalMath("const integral = derivative * delta;", "Imprecisão Monetária")).toBe(true);
            expect(vetoEngine.isTechnicalMath("let matrix = scalar * vector;", "Imprecisão Monetária")).toBe(true);
        });

        it("should return false if line contains neither money terms nor technical terms", () => {
            // Arrange - Component: VetoEngine | Pattern: AAA
            const vetoEngine = new VetoEngine();

            // Act & Assert
            expect(vetoEngine.isTechnicalMath("console.log('hello world');", "Imprecisão Monetária")).toBe(false);
        });
    });

    describe("isRuleDefinition", () => {
        it("should return true for lines matching rule definition keywords", () => {
            // Arrange - Component: VetoEngine | Pattern: AAA
            const vetoEngine = new VetoEngine();

            // Act & Assert
            expect(vetoEngine.isRuleDefinition("const rules = [ 'rule1', 'rule2' ];")).toBe(true);
            expect(vetoEngine.isRuleDefinition("let audit_rules = {};")).toBe(true);
            expect(vetoEngine.isRuleDefinition("const heuristic = (x) => x > 0;")).toBe(true);
            expect(vetoEngine.isRuleDefinition("const veto_criteria = ['sec'];")).toBe(true);
        });

        it("should return false for standard source code lines", () => {
            // Arrange - Component: VetoEngine | Pattern: AAA
            const vetoEngine = new VetoEngine();

            // Act & Assert
            expect(vetoEngine.isRuleDefinition("function processData(input: string) { return input.trim(); }")).toBe(false);
            expect(vetoEngine.isRuleDefinition("let value = 42;")).toBe(false);
        });
    });
});
