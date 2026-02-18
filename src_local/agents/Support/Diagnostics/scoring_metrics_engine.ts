import winston from "winston";
import { MetricsEngine, type MetricsResult } from "./metrics_engine";

const logger = winston.child({ module: "ScoringMetricsEngine" });

/**
 * ⚙️ ScoringMetricsEngine — PhD in Health Metrics & Stability Calculus
 * Motor auxiliar para cálculo de métricas (Redução de Entropia).
 * 
 * Agora integrado com MetricsEngine para 9+ métricas de qualidade:
 * - Complexidade Ciclomática
 * - Complexidade Cognitiva
 * - Complexidade Halstead
 * - Profundidade de Aninhamento
 * - LOC (Lines of Code)
 * - CBO (Coupling Between Objects)
 * - Ca (Acoplamento Aferente)
 * - DIT (Depth of Inheritance Tree)
 * - Índice de Manutenibilidade
 */
export class ScoringMetricsEngine {
    private metricsEngine: MetricsEngine;

    constructor() {
        this.metricsEngine = new MetricsEngine();
    }

    /**
     * Calcula métricas avançadas para um arquivo usando o MetricsEngine
     */
    calculateAdvancedMetrics(content: string, filePath: string, dependencies: string[] = [], bugCount: number = 0): MetricsResult {
        return this.metricsEngine.analyzeFile(content, filePath, dependencies, bugCount);
    }

    /**
     * Valida compliance de um shadow
     */
    validateShadow(filePath: string, content: string, dependencies: string[]): { compliant: boolean; reason: string; metrics: MetricsResult } {
        const metrics = this.metricsEngine.analyzeFile(content, filePath, dependencies);
        const validation = this.metricsEngine.validateShadowCompliance(metrics);
        return { ...validation, metrics };
    }
    calcPurity(mapData: Record<string, any>, total: number): [number, number] {
        // Usa métricas avançadas se disponíveis, senão usa complexidade simples
        let totalCC = 0;
        let totalCognitive = 0;
        let countWithAdvanced = 0;
        
        for (const [file, info] of Object.entries(mapData)) {
            const advanced = info.advanced_metrics;
            
            if (advanced) {
                // Usar Complexidade Ciclomática real
                if (advanced.cyclomaticComplexity) {
                    totalCC += advanced.cyclomaticComplexity;
                    countWithAdvanced++;
                }
                // Usar Complexidade Cognitiva
                if (advanced.cognitiveComplexity) {
                    totalCognitive += advanced.cognitiveComplexity;
                }
            }
        }
        
        // Se temos métricas avançadas, usamos CC média em vez de complexidade simples
        let avg: number;
        if (countWithAdvanced > 0) {
            // Ponderar CC e complexidade simples
            const avgCC = totalCC / countWithAdvanced;
            const simpleAvg = Object.values(mapData).reduce((sum, i) => sum + (i.complexity || 1), 0) / total;
            avg = (avgCC + simpleAvg) / 2;
        } else {
            avg = Object.values(mapData).reduce((sum, i) => sum + (i.complexity || 1), 0) / total;
        }
        
        const score = Math.max(0, 20 - (Math.max(0, avg - 5) * 1.5));
        return [score, avg];
    }

    /**
     * Calcula stability considerando shadows compliance como "testados"
     */
    calcStability(mapData: Record<string, any>): [number, number, number] {
        const coreTypes = ["AGENT", "CORE", "LOGIC", "UTIL"];
        const relevant = Object.entries(mapData).filter(([f, i]) =>
            coreTypes.includes(i.component_type) ||
            (i.complexity > 1 && !["DOC", "INTERFACE", "TEST"].includes(i.component_type))
        ).map(([f, i]) => i);

        const packageMarkers = Object.entries(mapData).filter(([f, i]) =>
            ["PACKAGE_MARKER", "CONFIG"].includes(i.component_type) && i.complexity <= 1
        ).map(([f, i]) => i);

        const covered = relevant.filter(i => i.has_test);
        
        // 📊 Contagem de shadows compliance (são considerados "covered")
        const shadowCompliant = relevant.filter(i => {
            const advanced = i.advanced_metrics;
            return advanced?.isShadow && advanced?.shadowCompliance?.compliant;
        });
        
        // 📊 Arquivos com Quality Gate GREEN também são considerados "covered"
        const qualityGreen = relevant.filter(i => {
            const advanced = i.advanced_metrics;
            return advanced?.qualityGate === "GREEN";
        });

        // Stability = (Testados + Marcadores + Shadows Compliant + Quality Green) / (Exigidos + Marcadores)
        const adjustedCovered = covered.length + shadowCompliant.length + qualityGreen.length;
        const score = ((adjustedCovered + packageMarkers.length) / Math.max(1, relevant.length + packageMarkers.length)) * 40;
        return [score, adjustedCovered + packageMarkers.length, relevant.length + packageMarkers.length];
    }

    calcObservability(mapData: Record<string, any>): [number, number, number] {
        const excluded = ["TEST", "PACKAGE_MARKER", "CONFIG"];
        const relevant = Object.entries(mapData).filter(([f, i]) =>
            !excluded.includes(i.component_type) || i.complexity > 1
        ).map(([f, i]) => i);

        const tel = relevant.filter(i => i.telemetry || JSON.stringify(i).includes("telemetry"));
        const score = (tel.length / Math.max(1, relevant.length)) * 15;
        return [score, tel.length, relevant.length];
    }

    calcSecurity(alerts: any[]): [number, number] {
        const high = alerts.filter(r => typeof r === 'object' && ["critical", "high"].includes(r.severity));
        return [Math.max(0, 15 - (high.length * 5)), high.length];
    }

    calcExcellence(mapData: Record<string, any>, total: number): [number, number] {
        const kdoc = Object.entries(mapData).filter(([f, i]) =>
            i.purpose !== "UNKNOWN" || ["PACKAGE_MARKER", "CONFIG"].includes(i.component_type)
        ).length;
        const score = (kdoc / Math.max(1, total)) * 10;
        return [score, kdoc];
    }

    /**
     * Identifica Pontos Cegos (Dark Matter) e Fragilidades.
     */
    getVitals(mapData: Record<string, any>): { dark_matter: string[], brittle_points: string[] } {
        const coreTypes = ["AGENT", "CORE", "LOGIC", "UTIL"];
        const dark_matter: string[] = [];
        const brittle_points: string[] = [];

        for (const [file, info] of Object.entries(mapData)) {
            const isRelevant = coreTypes.includes(info.component_type) ||
                (info.complexity > 1 && !["DOC", "INTERFACE", "TEST"].includes(info.component_type));

            if (isRelevant && !info.has_test) {
                dark_matter.push(file);
                if (info.complexity > 10) {
                    brittle_points.push(file);
                }
            }
        }
        return { dark_matter, brittle_points };
    }

    /**
     * Calcula score de qualidade baseado nas 9 métricas avançadas
     * Integra com o sistema existente de 5 pilares (100 pontos)
     * e adiciona validação especial para shadows
     */
    calcQualityScore(metrics: MetricsResult): number {
        let score = 0;

        // 1. Manutenibilidade (0-25) — mais importante
        if (metrics.maintainabilityIndex >= 20) {
            score += 25;
        } else if (metrics.maintainabilityIndex >= 10) {
            score += 15;
        } else {
            score += 5;
        }

        // 2. Complexidade Ciclomática (0-20)
        if (metrics.cyclomaticComplexity <= 10) {
            score += 20;
        } else if (metrics.cyclomaticComplexity <= 20) {
            score += 15;
        } else if (metrics.cyclomaticComplexity <= 30) {
            score += 10;
        } else {
            score += 5;
        }

        // 3. Complexidade Cognitiva (0-15)
        if (metrics.cognitiveComplexity <= 10) {
            score += 15;
        } else if (metrics.cognitiveComplexity <= 20) {
            score += 10;
        } else if (metrics.cognitiveComplexity <= 30) {
            score += 5;
        }

        // 4. Profundidade de Aninhamento (0-10)
        if (metrics.nestingDepth <= 3) {
            score += 10;
        } else if (metrics.nestingDepth <= 5) {
            score += 5;
        }

        // 5. Acoplamento CBO (0-10)
        if (metrics.cbo <= 3) {
            score += 10;
        } else if (metrics.cbo <= 5) {
            score += 5;
        }

        // 6. Densidade de Defeitos (0-10)
        if (metrics.defectDensity <= 1) {
            score += 10;
        } else if (metrics.defectDensity <= 3) {
            score += 5;
        }

        // 7. Herança (0-5)
        if (metrics.dit <= 2) {
            score += 5;
        }

        // 8. Quality Gate (0-5)
        if (metrics.qualityGate === "GREEN") {
            score += 5;
        } else if (metrics.qualityGate === "YELLOW") {
            score += 2;
        }

        return score; // Max 100
    }

    /**
     * Calcula complexidade efetiva para shadows
     * Shadows devem ter complexidade baixa para serem facilmente testáveis
     * 
     * Regra: Se for shadow, usa a complexidade própria (shadowComplexity)
     * em vez da complexidade total que inclui dependências
     */
    getEffectiveComplexity(metrics: MetricsResult): number {
        if (metrics.isShadow) {
            // Para shadows, usamos complexidade própria (sem dependências)
            // Isso permite que shadows que importam engines complexas
            // ainda assim sejam considerados "simples" se seu código próprio é simples
            return metrics.shadowComplexity;
        }
        return metrics.cyclomaticComplexity;
    }

    /**
     * Avalia se um arquivo (especialmente shadow) atende aos requisitos de qualidade
     */
    evaluateQualityGate(metrics: MetricsResult): { 
        passed: boolean; 
        issues: string[]; 
        score: number 
    } {
        const issues: string[] = [];
        let score = 0;

        // Para shadows, critérios mais rigorosos
        const isShadow = metrics.isShadow;
        const maxCC = isShadow ? 15 : 50;
        const maxCognitive = isShadow ? 10 : 30;
        const minMI = isShadow ? 20 : 10;
        const maxNesting = isShadow ? 3 : 5;
        const maxCBO = isShadow ? 2 : 10;

        // Complexidade Ciclomática
        if (metrics.cyclomaticComplexity > maxCC) {
            issues.push(`CC ${metrics.cyclomaticComplexity} excede limite ${maxCC}`);
        } else {
            score += 20;
        }

        // Complexidade Cognitiva
        if (metrics.cognitiveComplexity > maxCognitive) {
            issues.push(`Cognitive ${metrics.cognitiveComplexity} excede limite ${maxCognitive}`);
        } else {
            score += 15;
        }

        // Manutenibilidade
        if (metrics.maintainabilityIndex < minMI) {
            issues.push(`MI ${metrics.maintainabilityIndex.toFixed(1)} abaixo de ${minMI}`);
        } else {
            score += 20;
        }

        // Profundidade
        if (metrics.nestingDepth > maxNesting) {
            issues.push(`Nesting ${metrics.nestingDepth} excede limite ${maxNesting}`);
        } else {
            score += 15;
        }

        // Acoplamento
        if (metrics.cbo > maxCBO) {
            issues.push(`CBO ${metrics.cbo} excede limite ${maxCBO}`);
        } else {
            score += 10;
        }

        // Quality Gate
        if (metrics.qualityGate === "GREEN") {
            score += 20;
        } else if (metrics.qualityGate === "YELLOW") {
            score += 10;
            issues.push("Quality Gate está em WARNING");
        } else {
            issues.push("Quality Gate está em FAIL");
        }

        return {
            passed: issues.length === 0,
            issues,
            score // Max 100
        };
    }
}
