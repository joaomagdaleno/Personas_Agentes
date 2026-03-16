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

        // Inline strategist logic (previously DiagnosticStrategist.planTargetedVerification)
        const plan: Record<string, Set<string>> = {};
        for (const f of findings) {
            if (!f || typeof f !== 'object') continue;
            const file = f.file;
            const context = f.context || f.agent;
            if (file && context) {
                if (!plan[file]) plan[file] = new Set();
                plan[file].add(context);
            }
        }
        if (findings.length > 0) {
            const verificationFindings = await this.orc.runTargetedVerification(plan);
            findings.push(...verificationFindings);
        }

        const targetFiles = this.orc.lastDetectedChanges || [];
        // Fallback for target files if none detected
        const filesFromFindings = targetFiles.length > 0 ? targetFiles :
            findings.filter(f => typeof f === 'object' && f.file).map(f => f.file);

        return await this.orc.coreValidator.verifyCoreHealth(this.orc.projectRoot.toString(), filesFromFindings);
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
