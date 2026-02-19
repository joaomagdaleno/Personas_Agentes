import winston from "winston";

const logger = winston.child({ module: "QualitySection" });

/**
 * 📐 QualitySection — Specialist in NIST/SonarQube metrics rendering.
 */
export class QualitySection {
    render(breakdown: any): string[] {
        const start = Date.now();
        const lines: string[] = [];

        // Penalidades normalizadas
        const p = {
            cc: breakdown["Quality (CC > 20 - High Risk)"] || 0,
            cog: breakdown["Quality (Cognitive > 15)"] || 0,
            nest: breakdown["Quality (Nesting > 3)"] || 0,
            cbo: breakdown["Quality (CBO > 10 - High Coupling)"] || 0,
            dit: breakdown["Quality (DIT > 5 - Deep Inheritance)"] || 0,
            miLow: breakdown["Quality (MI < 10 - Low Maint)"] || 0,
            miCrit: breakdown["Quality (MI < 5 - Critical)"] || 0,
            gateRed: breakdown["Quality (Gate RED)"] || 0,
            shadow: breakdown["Quality (Shadow Non-Compliant)"] || 0
        };

        // Contagens brutas
        const c = {
            cc: breakdown["_raw_ccCount"] || 0,
            cog: breakdown["_raw_cognitiveCount"] || 0,
            nest: breakdown["_raw_nestingCount"] || 0,
            cbo: breakdown["_raw_cboCount"] || 0,
            dit: breakdown["_raw_ditCount"] || 0,
            miLow: breakdown["_raw_miLowCount"] || 0,
            miCrit: breakdown["_raw_miCriticalCount"] || 0,
            gateRed: breakdown["_raw_gateRedCount"] || 0,
            shadow: breakdown["_raw_shadowCount"] || 0,
            totalAnalyzed: breakdown["_raw_totalAnalyzed"] || 0
        };

        const totalPenalty = Math.round(Object.values(p).reduce((a, b) => a + b, 0) * 10) / 10;

        if (totalPenalty > 0 || c.totalAnalyzed > 0) {
            lines.push("### 📐 Métricas de Qualidade (NIST/SONARQUBE)");
            lines.push("");
            lines.push("| Métrica | Limite | Violações | Penalidade |");
            lines.push("| :--- | :--- | :---: | ---: |");
            lines.push(`| Complexidade Ciclomática (CC > 20) | > 20 | ${c.cc}/${c.totalAnalyzed} | ${p.cc} pts |`);
            lines.push(`| Complexidade Cognitiva (> 15) | > 15 | ${c.cog}/${c.totalAnalyzed} | ${p.cog} pts |`);
            lines.push(`| Aninhamento Profundo (> 3) | > 3 | ${c.nest}/${c.totalAnalyzed} | ${p.nest} pts |`);
            lines.push(`| Alto Acoplamento (CBO > 10) | > 10 | ${c.cbo}/${c.totalAnalyzed} | ${p.cbo} pts |`);
            lines.push(`| Herança Profunda (DIT > 5) | > 5 | ${c.dit}/${c.totalAnalyzed} | ${p.dit} pts |`);
            lines.push(`| Baixa Manutenibilidade (MI < 10) | < 10 | ${c.miLow}/${c.totalAnalyzed} | ${p.miLow} pts |`);
            lines.push(`| Manutenibilidade Crítica (MI < 5) | < 5 | ${c.miCrit}/${c.totalAnalyzed} | ${p.miCrit} pts |`);
            lines.push(`| Quality Gate RED | - | ${c.gateRed}/${c.totalAnalyzed} | ${p.gateRed} pts |`);
            lines.push(`| Shadow Non-Compliant | - | ${c.shadow}/${c.totalAnalyzed} | ${p.shadow} pts |`);
            lines.push("");
            lines.push(`> **Penalidade Total de Qualidade:** \`${totalPenalty} pts\` (cap: 30) | Base: NIST, SonarQube, Microsoft`);
            lines.push("");
        }

        logger.debug(`Quality section rendered in ${Date.now() - start}ms`);
        return lines;
    }
}
