import winston from 'winston';
import * as path from 'path';
import { CognitiveValidator } from "../../../utils/cognitive_validator";
import type { CognitiveHealthReport } from "../../../utils/cognitive_validator";
import { MetricsEngine } from "./metrics_engine";

/**
 * Assistente Técnico: Analista de Densidade de Verificação 📏
 * 
 * Agora integrado com MetricsEngine para 9+ métricas de qualidade:
 * - Complexidade Ciclomática
 * - Complexidade Cognitiva  
 * - Complexidade Halstead
 * - Profundidade de Aninhamento
 * - LOC / SLOC
 * - CBO / Ca
 * - DIT
 * - Índice de Manutenibilidade
 * - Densidade de Defeitos
 */
export class QualityAnalyst {
    private metricsEngine: MetricsEngine;

    constructor() {
        this.metricsEngine = new MetricsEngine();
    }
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
     * Agora inclui as 9+ métricas de qualidade.
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

            // 📊 Extrair métricas avançadas do contexto (se disponíveis)
            const advancedMetrics = info.advanced_metrics || {};
            
            // 🎯 Para shadows: usar complexidade própria se disponível
            const effectiveComplexity = advancedMetrics.isShadow && advancedMetrics.shadowComplexity
                ? advancedMetrics.shadowComplexity
                : complexity;

            matrix.push({
                file: file,
                complexity: effectiveComplexity, // Usar complexidade efetiva para shadows
                originalComplexity: complexity,
                assertions: assertions,
                coverage_ratio: Number(ratio.toFixed(2)),
                test_status: status,
                // Coupling/Instabilidade
                instability: (info.coupling?.instability || 0),
                // 📊 Novas métricas de qualidade (9+)
                advanced_metrics: {
                    cyclomaticComplexity: advancedMetrics.cyclomaticComplexity || 0,
                    cognitiveComplexity: advancedMetrics.cognitiveComplexity || 0,
                    halsteadVolume: advancedMetrics.halsteadVolume || 0,
                    halsteadDifficulty: advancedMetrics.halsteadDifficulty || 0,
                    nestingDepth: advancedMetrics.nestingDepth || 0,
                    loc: advancedMetrics.loc || 0,
                    sloc: advancedMetrics.sloc || 0,
                    cbo: advancedMetrics.cbo || 0,
                    ca: advancedMetrics.ca || 0,
                    dit: advancedMetrics.dit || 0,
                    maintainabilityIndex: advancedMetrics.maintainabilityIndex || 0,
                    defectDensity: advancedMetrics.defectDensity || 0,
                    riskLevel: advancedMetrics.riskLevel || "LOW",
                    qualityGate: advancedMetrics.qualityGate || "GREEN",
                    isShadow: advancedMetrics.isShadow || false,
                    shadowComplexity: advancedMetrics.shadowComplexity || 0,
                    shadowCompliance: info.shadow_compliance || null
                }
            });
        }

        return matrix.sort((a, b) => b.complexity - a.complexity);
    }

    /**
     * Calcula métricas agregadas de qualidade para todo o projeto
     */
    calculateProjectQualityMetrics(matrix: any[]): any {
        const total = matrix.length;
        
        // Estatísticas básicas
        const avgComplexity = matrix.reduce((sum, m) => sum + (m.complexity || 0), 0) / total;
        const avgCC = matrix.reduce((sum, m) => sum + (m.advanced_metrics?.cyclomaticComplexity || 0), 0) / total;
        const avgCognitive = matrix.reduce((sum, m) => sum + (m.advanced_metrics?.cognitiveComplexity || 0), 0) / total;
        const avgMI = matrix.reduce((sum, m) => sum + (m.advanced_metrics?.maintainabilityIndex || 0), 0) / total;
        
        // Contagens por categoria
        const riskCounts = { LOW: 0, MODERATE: 0, HIGH: 0, CRITICAL: 0 };
        const gateCounts = { GREEN: 0, YELLOW: 0, RED: 0 };
        const statusCounts = { DEEP: 0, SHALLOW: 0, STRUCTURAL: 0 };
        const shadowCounts = { compliant: 0, non_compliant: 0 };
        
        for (const m of matrix) {
            // Risk Level
            const risk = m.advanced_metrics?.riskLevel || "LOW";
            if (riskCounts[risk] !== undefined) riskCounts[risk]++;
            
            // Quality Gate
            const gate = m.advanced_metrics?.qualityGate || "GREEN";
            if (gateCounts[gate] !== undefined) gateCounts[gate]++;
            
            // Test Status
            const status = m.test_status || "SHALLOW";
            if (statusCounts[status] !== undefined) statusCounts[status]++;
            
            // Shadow Compliance
            if (m.advanced_metrics?.isShadow) {
                const compliance = m.advanced_metrics?.shadowCompliance;
                if (compliance?.compliant) {
                    shadowCounts.compliant++;
                } else {
                    shadowCounts.non_compliant++;
                }
            }
        }

        return {
            summary: {
                total_files: total,
                avg_complexity: Number(avgComplexity.toFixed(2)),
                avg_cyclomatic_complexity: Number(avgCC.toFixed(2)),
                avg_cognitive_complexity: Number(avgCognitive.toFixed(2)),
                avg_maintainability_index: Number(avgMI.toFixed(2))
            },
            risk_distribution: riskCounts,
            quality_gate_distribution: gateCounts,
            test_coverage_distribution: statusCounts,
            shadow_compliance: shadowCounts
        };
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
