import winston from 'winston';
import * as path from 'path';
import { CognitiveValidator } from "../../../utils/cognitive_validator";
import type { CognitiveHealthReport } from "../../../utils/cognitive_validator";

/**
 * Assistente Técnico: Analista de Densidade de Verificação 📏
 */
export class QualityAnalyst {
    /**
     * 🧠 Classifica a natureza estrutural de um arquivo.
     * Retorna "STRUCTURAL" (barrel/constants/types), "FACADE" (delegação pura), ou "LOGIC" (lógica real).
     */
    private classifyStructure(file: string, info: any): "STRUCTURAL" | "FACADE" | "LOGIC" {
        const compType = info.component_type || "";
        const complexity = info.complexity || 0;

        // Tier 1: STRUCTURAL — Arquivos sem lógica testável
        // Barrels, package markers, configs, interfaces, type definitions
        if (["PACKAGE_MARKER", "CONFIG", "INTERFACE"].includes(compType)) {
            return "STRUCTURAL";
        }

        // Arquivos com complexidade mínima (≤ 5) são estruturais
        // Isso cobre: barrels (index.ts), constantes (theme.ts), definições (safety_definitions.ts)
        if (complexity <= 5) {
            return "STRUCTURAL";
        }

        // Tier 2: FACADE — Complexidade baixa, apenas delegação
        if (complexity <= 15) {
            return "FACADE";
        }

        // Tier 3: LOGIC — Tudo o resto precisa de cobertura profunda
        return "LOGIC";
    }

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

            // 🧠 Structural Intelligence: Adaptive thresholds based on file classification
            const structure = this.classifyStructure(file, info);
            const ratio = (assertions * 5) / complexity;
            let status: string;

            if (structure === "STRUCTURAL") {
                // Arquivos estruturais de complexidade mínima (≤1): auto-pass (nada a testar)
                // Arquivos estruturais com alguma lógica (2-5): precisam de smoke test
                status = (complexity <= 1 || assertions >= 1) ? "STRUCTURAL" : "SHALLOW";
            } else if (structure === "FACADE") {
                // Facades: precisam de validação de wiring (≥ 3 asserções)
                status = assertions >= 3 ? "DEEP" : (assertions >= 1 ? "STRUCTURAL" : "SHALLOW");
            } else {
                // Lógica real: ratio-based (mantém comportamento original)
                if (assertions === 0) {
                    status = "SHALLOW";
                } else if (ratio >= 0.5) {
                    status = "DEEP";
                } else {
                    status = "SHALLOW";
                }
            }

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
