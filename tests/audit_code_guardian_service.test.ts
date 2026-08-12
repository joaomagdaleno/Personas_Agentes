import { describe, it, expect } from "bun:test";
import {
    AuditCodeGuardianService,
    DiagnosticStrategist,
    MaturityEvaluator,
    AuditRiskEngine
} from "../src_local/engines/diagnostics/audit_code_guardian_service.ts";

describe("AuditCodeGuardianService Deep Test Suite", () => {
    it("should instantiate AuditCodeGuardianService correctly", () => {
        const service = new AuditCodeGuardianService(process.cwd());
        expect(service).toBeDefined();
    });

    it("should plan targeted verification in DiagnosticStrategist", () => {
        const strategist = new DiagnosticStrategist();
        const findings = [
            { file: "main.ts", agent: "LogicAuditor" },
            { file: "main.ts", agent: "SecurityGuard" },
            { file: "utils.ts", agent: "LogicAuditor" }
        ];
        const plan = strategist.planTargetedVerification(findings);
        expect(plan["main.ts"]?.has("LogicAuditor")).toBe(true);
        expect(plan["main.ts"]?.has("SecurityGuard")).toBe(true);
        expect(plan["utils.ts"]?.has("LogicAuditor")).toBe(true);
    });

    it("should calculate I/O efficiency ratio", () => {
        const strategist = new DiagnosticStrategist();
        const eff = strategist.calculateEfficiency(100, 20);
        expect(eff.saved_io).toBe(80);
        expect(eff.efficiency_label).toBe("ALTA");
    });

    it("should calculate technical maturity level for source code", () => {
        const evaluator = new MaturityEvaluator();
        const richCode = `
            import winston from "winston";
            import { Path } from "node:path";
            const logger = winston.child({ module: "test" });
            function reasonAboutObjective() {}
            function selfDiagnostic() {}
        `;
        const maturity = evaluator.calculateMaturity(richCode, "TypeScript");
        expect(maturity.score).toBeGreaterThan(0);
        expect(maturity).toHaveProperty("level");
    });

    it("should scan code for risk patterns in AuditRiskEngine", () => {
        const riskEngine = new AuditRiskEngine();
        const codeWithRisk = `
            const result = eval("2 + 2");
            console.log(result);
        `;
        const risks = riskEngine.scanFile(codeWithRisk, "test.ts");
        expect(risks.length).toBeGreaterThan(0);
        expect(risks[0]!.severity).toBe("CRITICAL");
    });
});
