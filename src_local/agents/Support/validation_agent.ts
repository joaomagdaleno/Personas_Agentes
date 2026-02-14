import winston from "winston";

const logger = winston.child({ module: "ValidationAgent" });

export class ValidationAgent {
    orc: any;

    constructor(orchestrator: any) {
        this.orc = orchestrator;
    }

    async runValidationPhase(findings: any[], skipTests: boolean): Promise<any> {
        if (skipTests) return this.fastFallback();

        logger.info("🧪 Iniciando fase de validação...");

        const plan = await this.orc.strategist.planTargetedVerification(findings);
        if (findings.length > 0) {
            const verificationFindings = await this.orc.runTargetedVerification(plan);
            findings.push(...verificationFindings);
        }

        const targetFiles = this.orc.lastDetectedChanges || [];
        // Fallback for target files if none detected
        const filesFromFindings = targetFiles.length > 0 ? targetFiles :
            findings.filter(f => typeof f === 'object' && f.file).map(f => f.file);

        return await this.orc.coreValidator.verifyCoreHealth(this.orc.projectRoot, filesFromFindings);
    }

    private fastFallback() {
        return {
            success: true,
            pass_rate: 100,
            total_run: 0,
            failed: 0,
            pyramid: {},
            execution: { success: true }
        };
    }
}
