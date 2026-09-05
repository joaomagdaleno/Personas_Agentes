import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import { CoderBridge } from "../src_local/utils/nim/coder_bridge.ts";
import { FormalVerificationEngine } from "../src_local/engines/healing/formal_verification_engine.ts";

describe("Coder Interface & Formal Verification Unit Tests", () => {
    describe("CoderBridge Unit Tests", () => {
        afterEach(() => {
            CoderBridge.getInstance().stopCoderApp();
        });

        it("should initialize CoderBridge and report valid telemetry under 30MB RAM", () => {
            const bridge = CoderBridge.getInstance();
            const telemetry = bridge.getTelemetry();

            expect(telemetry).toHaveProperty("isRunning");
            expect(telemetry).toHaveProperty("memoryUsageMb");
            expect(telemetry.memoryUsageMb).toBeLessThan(30.0);
            expect(telemetry).toHaveProperty("activeMode");
            expect(telemetry).toHaveProperty("sovereignScore");
        });

        it("should start and stop Coder native UI cleanly", () => {
            const bridge = CoderBridge.getInstance();
            const started = bridge.startCoderApp();
            expect(started).toBe(true);

            const telemetry = bridge.getTelemetry();
            expect(telemetry.isRunning).toBe(true);

            bridge.stopCoderApp();
            expect(bridge.getTelemetry().isRunning).toBe(false);
        });
    });

    describe("FormalVerificationEngine Unit Tests", () => {
        it("should approve valid safe patches that satisfy all 3 formal contracts", () => {
            const verifier = FormalVerificationEngine.getInstance();

            const safePatch = `
                function updateScore(userId: string, delta: number): void {
                    if (delta <= 0) return;
                    db.run("UPDATE users SET score = score + ? WHERE id = ?", [delta, userId]);
                }
            `;

            const report = verifier.verifyPatch(safePatch, "src/services/user.ts");
            expect(report.approved).toBe(true);
            expect(report.contracts.length).toBeGreaterThanOrEqual(3);
            expect(report.contracts.every(c => c.passed)).toBe(true);
        });

        it("should REJECT patches violating Contract A (Finite Termination Proof)", () => {
            const verifier = FormalVerificationEngine.getInstance();

            const badPatch = `
                function processQueue(): void {
                    while (true) {
                        doWork();
                    }
                }
            `;

            const report = verifier.verifyPatch(badPatch, "src/worker.ts");
            expect(report.approved).toBe(false);
            expect(report.rejectionReason).toContain("Contract A");
            expect(report.rejectionReason).toContain("infinite loop");
        });

        it("should REJECT patches violating Contract B (Memory & Array Bounds)", () => {
            const verifier = FormalVerificationEngine.getInstance();

            const badPatch = `
                function getHead(arr: any[]): any {
                    return arr[-1];
                }
            `;

            const report = verifier.verifyPatch(badPatch, "src/utils.ts");
            expect(report.approved).toBe(false);
            expect(report.rejectionReason).toContain("Contract B");
            expect(report.rejectionReason).toContain("out-of-bounds");
        });

        it("should REJECT patches violating Contract C (SQLite Invariants - Unbounded DELETE)", () => {
            const verifier = FormalVerificationEngine.getInstance();

            const badPatch = `
                function clearOldData(): void {
                    db.run("DELETE FROM logs");
                }
            `;

            const report = verifier.verifyPatch(badPatch, "src/db.ts");
            expect(report.approved).toBe(false);
            expect(report.rejectionReason).toContain("Contract C");
            expect(report.rejectionReason).toContain("DELETE FROM");
        });

        it("should REJECT patches violating Contract C (SQLite Invariants - Unbounded UPDATE)", () => {
            const verifier = FormalVerificationEngine.getInstance();

            const badPatch = `
                function resetStatus(): void {
                    db.run("UPDATE tasks SET status = 'PENDING'");
                }
            `;

            const report = verifier.verifyPatch(badPatch, "src/db.ts");
            expect(report.approved).toBe(false);
            expect(report.rejectionReason).toContain("Contract C");
            expect(report.rejectionReason).toContain("UPDATE");
        });
    });
});
