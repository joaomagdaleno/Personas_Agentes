import winston from 'winston';
import * as path from 'path';
import { CognitiveValidator } from "../../../utils/cognitive_validator";
import type { CognitiveHealthReport } from "../../../utils/cognitive_validator";

/**
 * Assistente Técnico: Analista de Densidade de Verificação 📏
 */
export class QualityAnalyst {
    /**
     * Correlaciona entropia de produção com cobertura de asserções via busca flexível.
     */
    calculateConfidenceMatrix(mapData: Record<string, any>): any[] {
        const matrix: any[] = [];

        for (const [file, info] of Object.entries(mapData)) {
            // Regra Soberana: Incluir tudo que não seja explicitamente ignorado
            const isSource = !file.endsWith("__init__.py") && !info.component_type?.includes("TEST");

            // Filtro de exclusão .agent (Especialista PhD)
            const f = file.toLowerCase().replace(/\\/g, "/");
            if ((f.includes("/.agent/") || f.startsWith(".agent/")) && !f.includes("fast-android-build")) {
                continue;
            }

            // Exclusão de Legacy Restore (Parity Only)
            if (f.includes("legacy_restore")) {
                continue;
            }

            if (!isSource) {
                continue;
            }

            const targetName = path.parse(file).name;
            const testInfo = this.findTestForModule(targetName, mapData);

            const complexity = info.complexity || 1;
            let assertions = 0;

            // Tenta pegar assertions do match de teste ou do próprio arquivo se for um script de teste
            if (testInfo) {
                assertions = testInfo.test_depth?.assertion_count || 0;
            }

            // Ratio calculation
            const ratio = (assertions * 5) / complexity;
            const status = (ratio >= 1.0 && assertions > 0) ? "DEEP" : "SHALLOW";

            matrix.push({
                file: file,
                complexity: complexity,
                assertions: assertions,
                coverage_ratio: Number(ratio.toFixed(2)),
                test_status: status
            });
        }

        return matrix.sort((a, b) => b.complexity - a.complexity);
    }

    /**
     * 🧠 Realiza uma auditoria de sanidade cognitiva no SLM.
     */
    async runCognitiveAudit(): Promise<CognitiveHealthReport> {
        const validator = new CognitiveValidator();
        return await validator.runFullCheck();
    }

    private findTestForModule(moduleName: string, mapData: Record<string, any>): any | null {
        const lowerName = moduleName.toLowerCase();
        for (const [file, info] of Object.entries(mapData)) {
            if (info.component_type === "TEST") {
                if (file.toLowerCase().includes(lowerName)) {
                    return info;
                }
            }
        }
        return null;
    }
}
