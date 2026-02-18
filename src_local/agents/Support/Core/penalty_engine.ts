import winston from "winston";

const logger = winston.child({ module: "PenaltyEngine" });

/**
 * ⚖️ PenaltyEngine — PhD in Health Penalties & Ceiling Calculus
 * Motor de Penalidades e Tetos de Saúde PhD.
 * 
 * Agora considera as 9+ métricas de qualidade:
 * - Complexidade Ciclomática > 50 = penalidade
 * - Manutenibilidade < 10 = penalidade
 * - Shadows não-compliance = penalidade
 */
export class PenaltyEngine {
    apply(raw: number, allAlerts: any[], mapData: Record<string, any>, total: number, qaData: any = null): number {
        const adjustments = this.getPilarAdjustments(allAlerts, mapData, qaData);
        const totalDrain = Object.entries(adjustments)
            .filter(([key]) => key.startsWith("Quality ("))
            .reduce((sum, [, v]) => sum + v, 0);

        let ceiling = 100;
        const alerts = allAlerts.filter(r => typeof r === 'object' && r !== null);
        const sevs = new Set(alerts.map(r => r.severity));

        if (sevs.has('critical') || sevs.has('high')) {
            ceiling = 60;
        } else if (sevs.has('medium')) {
            ceiling = 85;
        } else if (totalDrain > 0) {
            ceiling = 99;
        }

        const final = Math.max(0, Math.round(Math.min(raw, ceiling) - totalDrain));
        logger.info(`🏆 [HealthCalculus] Raw: ${raw.toFixed(3)} | Ceiling: ${ceiling} | Drain: ${totalDrain} | Final: ${final}`);
        return final;
    }

    getPilarAdjustments(allAlerts: any[], mapData: Record<string, any>, qaData: any = null): Record<string, number> {
        const coreTypes = ["AGENT", "CORE", "LOGIC", "UTIL"];

        // 📊 PENALIDADES NORMALIZADAS (v2.0)
        // Cada categoria usa proporção (violações / total) × cap
        // Em vez de acumulação linear ilimitada
        // Caps baseados em NIST, SonarQube, Microsoft

        // Caps por categoria (pontos máximos de penalidade)
        const CAPS = {
            cc: 5,           // CC > 20 (NIST: alto risco)
            cognitive: 4,    // Cognitive > 15 (SonarQube)
            nesting: 3,      // Nesting > 3 (best practice)
            cbo: 3,          // CBO > 10 (CK metrics)
            dit: 2,          // DIT > 5 (CK metrics)
            miLow: 4,        // MI < 10 (Microsoft: vermelho)
            miCritical: 3,   // MI < 5 (crítico)
            defect: 3,       // Defects > 1/KLOC
            gateRed: 3,      // Quality Gate RED
            shadow: 3,       // Shadow não-compliance
        };
        const GLOBAL_QUALITY_CAP = 30; // Teto global de penalidades de qualidade

        // Contadores de violações
        let ccCount = 0;
        let cognitiveCount = 0;
        let nestingCount = 0;
        let cboCount = 0;
        let ditCount = 0;
        let miLowCount = 0;
        let miCriticalCount = 0;
        let defectCount = 0;
        let gateRedCount = 0;
        let shadowCount = 0;
        let totalAnalyzed = 0;

        // Penalidades Legacy (mantidas para compatibilidade)
        let shallowCount = 0;

        if (qaData?.matrix && Array.isArray(qaData.matrix)) {
            totalAnalyzed = qaData.matrix.length;

            for (const item of qaData.matrix) {
                const m = item.advanced_metrics || {};

                if (m.cyclomaticComplexity > 20) ccCount++;
                if (m.cognitiveComplexity > 15) cognitiveCount++;
                if (m.nestingDepth > 3) nestingCount++;
                if (m.cbo > 10) cboCount++;
                if (m.dit > 5) ditCount++;
                if (m.maintainabilityIndex > 0 && m.maintainabilityIndex < 10) miLowCount++;
                if (m.maintainabilityIndex > 0 && m.maintainabilityIndex < 5) miCriticalCount++;
                if (m.defectDensity > 1) defectCount++;
                if (m.qualityGate === "RED") gateRedCount++;
                if (m.isShadow && m.shadowCompliance && !m.shadowCompliance.compliant) shadowCount++;
            }

            // Legacy: Shallow tests
            shallowCount = qaData.matrix.filter((m: any) => {
                const item = mapData[m.file] || {};
                return m.test_status === "SHALLOW" && (
                    coreTypes.includes(item.component_type) ||
                    (item.complexity > 1 && !["DOC", "INTERFACE", "TEST"].includes(item.component_type))
                );
            }).length;
        }

        // Calcular penalidades proporcionais: (violações / total) × cap
        const safeTotal = Math.max(1, totalAnalyzed);
        const proportional = (count: number, cap: number) =>
            Math.round(Math.min(cap, (count / safeTotal) * cap) * 10) / 10;

        let ccPenalty = proportional(ccCount, CAPS.cc);
        let cognitivePenalty = proportional(cognitiveCount, CAPS.cognitive);
        let nestingPenalty = proportional(nestingCount, CAPS.nesting);
        let cboPenalty = proportional(cboCount, CAPS.cbo);
        let ditPenalty = proportional(ditCount, CAPS.dit);
        let miLowPenalty = proportional(miLowCount, CAPS.miLow);
        let miCriticalPenalty = proportional(miCriticalCount, CAPS.miCritical);
        let defectPenalty = proportional(defectCount, CAPS.defect);
        let gateRedPenalty = proportional(gateRedCount, CAPS.gateRed);
        let shadowPenalty = proportional(shadowCount, CAPS.shadow);

        // Aplicar teto global de qualidade
        let totalQuality = ccPenalty + cognitivePenalty + nestingPenalty + cboPenalty +
            ditPenalty + miLowPenalty + miCriticalPenalty + defectPenalty +
            gateRedPenalty + shadowPenalty;

        if (totalQuality > GLOBAL_QUALITY_CAP) {
            const scale = GLOBAL_QUALITY_CAP / totalQuality;
            ccPenalty = Math.round(ccPenalty * scale * 10) / 10;
            cognitivePenalty = Math.round(cognitivePenalty * scale * 10) / 10;
            nestingPenalty = Math.round(nestingPenalty * scale * 10) / 10;
            cboPenalty = Math.round(cboPenalty * scale * 10) / 10;
            ditPenalty = Math.round(ditPenalty * scale * 10) / 10;
            miLowPenalty = Math.round(miLowPenalty * scale * 10) / 10;
            miCriticalPenalty = Math.round(miCriticalPenalty * scale * 10) / 10;
            defectPenalty = Math.round(defectPenalty * scale * 10) / 10;
            gateRedPenalty = Math.round(gateRedPenalty * scale * 10) / 10;
            shadowPenalty = Math.round(shadowPenalty * scale * 10) / 10;
        }

        logger.info(`📊 [PenaltyNorm] Total analisado: ${totalAnalyzed} | CC>${20}: ${ccCount} | Cog>${15}: ${cognitiveCount} | Nest>${3}: ${nestingCount} | GateRED: ${gateRedCount}`);

        // Security Drain
        const alerts = allAlerts.filter(r => typeof r === 'object' && r !== null);
        const sevMap: Record<string, number> = { 'critical': 15, 'high': 15, 'medium': 5, 'low': 1 };
        const secDrain = alerts.reduce((sum, r) => sum + (sevMap[r.severity] || 0), 0);

        // Strategic (Roadmap) points
        const stratCount = allAlerts.filter(r => typeof r === 'string').length;

        return {
            // Métricas de Qualidade Normalizadas (proporcionais com caps)
            "Quality (CC > 20 - High Risk)": ccPenalty,
            "Quality (Cognitive > 15)": cognitivePenalty,
            "Quality (Nesting > 3)": nestingPenalty,
            "Quality (CBO > 10 - High Coupling)": cboPenalty,
            "Quality (DIT > 5 - Deep Inheritance)": ditPenalty,
            "Quality (MI < 10 - Low Maint)": miLowPenalty,
            "Quality (MI < 5 - Critical)": miCriticalPenalty,
            "Quality (Defect Density > 1/KLOC)": defectPenalty,
            "Quality (Gate RED)": gateRedPenalty,
            "Quality (Shadow Non-Compliant)": shadowPenalty,

            // Dados brutos (para o relatório exibir contagens)
            "_raw_ccCount": ccCount,
            "_raw_cognitiveCount": cognitiveCount,
            "_raw_nestingCount": nestingCount,
            "_raw_cboCount": cboCount,
            "_raw_ditCount": ditCount,
            "_raw_miLowCount": miLowCount,
            "_raw_miCriticalCount": miCriticalCount,
            "_raw_defectCount": defectCount,
            "_raw_gateRedCount": gateRedCount,
            "_raw_shadowCount": shadowCount,
            "_raw_totalAnalyzed": totalAnalyzed,

            // Legado
            "Stability (Coverage)": shallowCount * 5.0,
            "Security (Vulnerabilities)": secDrain,
            "Excellence (Documentation)": stratCount * 0.5
        };
    }
}
