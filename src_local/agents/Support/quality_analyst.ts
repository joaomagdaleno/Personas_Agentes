import winston from 'winston';
import * as path from 'path';

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
            const isSource = file.includes("src/") || file.includes("src_local/") || ["AGENT", "CORE", "LOGIC"].includes(info.component_type);
            if (!isSource || info.component_type === "TEST" || file.endsWith("__init__.py")) {
                continue;
            }

            const targetName = path.parse(file).name;
            const testInfo = this.findTestForModule(targetName, mapData);

            const complexity = info.complexity || 1;
            let assertions = 0;
            if (testInfo) {
                assertions = testInfo.test_depth?.assertion_count || 0;
            }

            const ratio = (assertions * 5) / complexity;

            matrix.push({
                file: file,
                complexity: complexity,
                assertions: assertions,
                coverage_ratio: Number(ratio.toFixed(2)),
                test_status: (ratio >= 1.0 && assertions > 0) ? "DEEP" : "SHALLOW"
            });
        }

        return matrix.sort((a, b) => b.complexity - a.complexity);
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
