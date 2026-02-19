import winston from 'winston';
import * as path from 'path';
import { CognitiveValidator } from "../../../utils/cognitive_validator";
import type { CognitiveHealthReport } from "../../../utils/cognitive_validator";
import { MetricsEngine } from "./metrics_engine";
import { StructureClassifier } from "./strategies/StructureClassifier.ts";
import { TestDiscoveryStrategy } from "./strategies/TestDiscoveryStrategy.ts";

import { StatusDeterminator } from "./strategies/StatusDeterminator.ts";
import { MatrixBuilder } from "./strategies/MatrixBuilder.ts";

const logger = winston.child({ module: "QualityAnalyst" });

export class QualityAnalyst {
    private metricsEngine: MetricsEngine;
    constructor() { this.metricsEngine = new MetricsEngine(); }

    calculateConfidenceMatrix(mapData: Record<string, any>): any[] {
        return Object.entries(mapData)
            .map(([file, info]) => MatrixBuilder.build(file, info, mapData, this.shouldSkipFile.bind(this), this.determineTestStatus.bind(this), this.mapAdvancedMetrics.bind(this)))
            .filter(item => item !== null)
            .sort((a, b) => b.complexity - a.complexity);
    }

    private shouldSkipFile(file: string, info: any): boolean {
        const f = file.toLowerCase().replace(/\\/g, "/");
        if (file.endsWith("__init__.py") || info.component_type?.includes("TEST")) return true;
        if (f.includes("legacy_restore")) return true;
        return (f.includes("/.agent/") || f.startsWith(".agent/")) && !f.includes("fast-android-build");
    }

    private determineTestStatus(structure: string, cc: number, assertions: number): string {
        return StatusDeterminator.determine(structure, cc, assertions);
    }

    private mapAdvancedMetrics(info: any, advanced: any) {
        const defaults = {
            cyclomaticComplexity: 0, cognitiveComplexity: 0, halsteadVolume: 0, halsteadDifficulty: 0,
            nestingDepth: 0, loc: 0, sloc: 0, cbo: 0, ca: 0, dit: 0, maintainabilityIndex: 0,
            defectDensity: 0, riskLevel: "LOW", qualityGate: "GREEN", isShadow: false, shadowComplexity: 0
        };
        return { ...defaults, ...advanced, shadowCompliance: info.shadow_compliance || null };
    }

    calculateProjectQualityMetrics(matrix: any[]): any {
        const total = matrix.length || 1;
        const stats = matrix.reduce((acc, m) => {
            const adv = m.advanced_metrics || {};
            acc.complexity += (m.complexity || 0); acc.cc += (adv.cyclomaticComplexity || 0); acc.cog += (adv.cognitiveComplexity || 0); acc.mi += (adv.maintainabilityIndex || 0);
            acc.risk[adv.riskLevel]++; acc.gate[adv.qualityGate]++; acc.status[m.test_status]++;
            if (adv.isShadow) (adv.shadowCompliance?.compliant ? acc.shadow.compliant++ : acc.shadow.non_compliant++);
            return acc;
        }, { complexity: 0, cc: 0, cog: 0, mi: 0, risk: { LOW: 0, MODERATE: 0, HIGH: 0, CRITICAL: 0 }, gate: { GREEN: 0, YELLOW: 0, RED: 0 }, status: { DEEP: 0, SHALLOW: 0, STRUCTURAL: 0, UNTESTED: 0 }, shadow: { compliant: 0, non_compliant: 0 } });

        return {
            summary: { total_files: matrix.length, avg_complexity: Number((stats.complexity / total).toFixed(2)), avg_cyclomatic_complexity: Number((stats.cc / total).toFixed(2)), avg_cognitive_complexity: Number((stats.cog / total).toFixed(2)), avg_maintainability_index: Number((stats.mi / total).toFixed(2)) },
            risk_distribution: stats.risk, quality_gate_distribution: stats.gate, test_coverage_distribution: stats.status, shadow_compliance: stats.shadow
        };
    }

    async runCognitiveAudit(): Promise<CognitiveHealthReport> {
        return await new CognitiveValidator().runFullCheck();
    }

    /**
     * Gera achados detalhados para violações de métricas na matriz.
     */
    generateMetricFindings(matrix: any[]): any[] {
        const findings: any[] = [];
        for (const item of matrix) {
            const adv = item.advanced_metrics || {};
            const file = item.file;

            if (adv.cognitiveComplexity > 15) {
                findings.push({
                    file,
                    line: 1,
                    issue: `Complexidade Cognitiva Elevada (${adv.cognitiveComplexity} > 15)`,
                    severity: adv.cognitiveComplexity > 25 ? "HIGH" : "MEDIUM",
                    category: "Quality",
                    context: "CognitiveAudit"
                });
            }

            if (adv.nestingDepth > 3) {
                findings.push({
                    file,
                    line: 1,
                    issue: `Aninhamento Excessivo (${adv.nestingDepth} > 3)`,
                    severity: "MEDIUM",
                    category: "Quality",
                    context: "StructuralAudit"
                });
            }

            if (adv.cyclomaticComplexity > 20) {
                findings.push({
                    file,
                    line: 1,
                    issue: `Complexidade Ciclomática Elevada (${adv.cyclomaticComplexity} > 20)`,
                    severity: adv.cyclomaticComplexity > 30 ? "HIGH" : "MEDIUM",
                    category: "Quality",
                    context: "MetricsEngine"
                });
            }
        }
        return findings;
    }
}
