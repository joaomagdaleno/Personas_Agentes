import { describe, it, expect } from "bun:test";
import {
    SecurityCloudGuardianService,
    ContextValidator,
    ObfuscationLogicEngine,
    DANGEROUS_KEYWORDS,
    ANALYZER_CLASSES
} from "../src_local/engines/security/security_cloud_guardian_service.ts";

describe("SecurityCloudGuardianService Deep Test Suite", () => {
    it("should instantiate SecurityCloudGuardianService correctly", () => {
        const service = new SecurityCloudGuardianService();
        expect(service).toBeDefined();
    });

    it("should validate Node context safety correctly", () => {
        const mockSourceFile = { fileName: "src_local/utils/test.test.ts" } as any;
        const isSafe = ContextValidator.isNodeSafe(
            {} as any,
            mockSourceFile,
            () => false,
            () => false,
            () => false
        );
        expect(isSafe).toBe(true);
    });

    it("should contain required dangerous keywords in safety rules", () => {
        expect(DANGEROUS_KEYWORDS.has("eval")).toBe(true);
        expect(DANGEROUS_KEYWORDS.has("exec")).toBe(true);
        expect(DANGEROUS_KEYWORDS.has("subprocess")).toBe(true);
    });

    it("should list core analyzer classes in safety identifiers", () => {
        expect(ANALYZER_CLASSES).toContain("LogicAuditor");
        expect(ANALYZER_CLASSES).toContain("MaturityEvaluator");
    });

    it("should resolve string constants in ObfuscationLogicEngine", () => {
        const engine = new ObfuscationLogicEngine();
        const literalNode = { type: "StringLiteral", value: "test_string" };
        expect(engine.resolveConstant(literalNode)).toBe("test_string");
    });

    it("should resolve binary concatenated expressions", () => {
        const engine = new ObfuscationLogicEngine();
        const binaryNode = {
            type: "BinaryExpression",
            operator: "+",
            left: { type: "StringLiteral", value: "ev" },
            right: { type: "StringLiteral", value: "al" }
        };
        expect(engine.resolveConstant(binaryNode)).toBe("eval");
    });
});
