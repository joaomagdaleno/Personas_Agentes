
import winston from "winston";

const logger = winston.child({ module: "DiagnosticStrategist" });

/**
 * 🧠 Estrategista de Diagnóstico PhD.
 * O cérebro tático do Orquestrador, responsável por planejar verificações
 * alvo e otimizar a eficiência de I/O.
 */
export class DiagnosticStrategist {

    /**
     * 🎯 Mapeia incidências para evitar redundância na Rodada de Verificação.
     */
    planTargetedVerification(initialFindings: any[]): Record<string, Set<string>> {
        const startPlan = Date.now();
        const auditMap: Record<string, Set<string>> = {};

        for (const f of initialFindings) {
            if (!f || typeof f !== 'object') continue;

            const file = f.file;
            const context = f.context || f.agent; // Adjust for TS schema

            if (file && context) {
                if (!auditMap[file]) auditMap[file] = new Set();
                auditMap[file].add(context);
            }
        }

        const duration = Date.now() - startPlan;
        logger.info(`⏱️ [Strategist] Plano alvo gerado em ${duration}ms`);
        return auditMap;
    }

    /**
     * Calcula o ganho de performance da orquestração cirúrgica.
     */
    calculateEfficiency(totalFiles: number, targetedFiles: number): any {
        if (totalFiles === 0) return { saved_io: 0, reduction_ratio: 0 };

        const reduction = ((totalFiles - targetedFiles) / totalFiles) * 100;

        return {
            total_scope: totalFiles,
            targeted_scope: targetedFiles,
            saved_io: Number(reduction.toFixed(2)),
            efficiency_label: reduction > 70 ? "ALTA" : "MODERADA"
        };
    }
}
