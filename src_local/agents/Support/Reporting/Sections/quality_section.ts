import winston from "winston";

const logger = winston.child({ module: "QualitySection" });

/**
 * 📐 QualitySection — Specialist in NIST/SonarQube metrics rendering.
 */
export class QualitySection {
    render(breakdown: any): string[] {
        const start = Date.now();
        const lines: string[] = [];

        const metrics = [
            { id: "cc", label: "Complexidade Ciclomática (CC > 20)", limit: "> 20", key: "cc" },
            { id: "cog", label: "Complexidade Cognitiva (> 15)", limit: "> 15", key: "cog" },
            { id: "nest", label: "Aninhamento Profundo (> 3)", limit: "> 3", key: "nest" },
            { id: "cbo", label: "Alto Acoplamento (CBO > 10)", limit: "> 10", key: "cbo" },
            { id: "dit", label: "Herança Profunda (DIT > 5)", limit: "> 5", key: "dit" },
            { id: "miLow", label: "Baixa Manutenibilidade (MI < 10)", limit: "< 10", key: "miLow" },
            { id: "miCrit", label: "Manutenibilidade Crítica (MI < 5)", limit: "< 5", key: "miCrit" },
            { id: "defect", label: "Defect Density (> 1/KLOC)", limit: "> 1", key: "defect" },
            { id: "gateRed", label: "Quality Gate RED", limit: "-", key: "gateRed" },
            { id: "shadow", label: "Shadow Non-Compliant", limit: "-", key: "shadow" }
        ];

        const p = this._extractValues(breakdown, "Quality (", ")");
        const c = this._extractValues(breakdown, "_raw_", "Count");
        const total = breakdown["_raw_totalAnalyzed"] || 0;
        const totalPenalty = Math.round(Object.values(p).reduce((a: any, b: any) => a + b, 0) * 10) / 10;

        if (totalPenalty > 0 || total > 0) {
            lines.push("### 📐 Métricas de Qualidade (NIST/SONARQUBE)", "");
            lines.push("| Métrica | Limite | Violações | Penalidade |", "| :--- | :--- | :---: | ---: |");
            metrics.forEach(m => lines.push(`| ${m.label} | ${m.limit} | ${c[m.id] || 0}/${total} | ${p[m.id] || 0} pts |`));
            lines.push("", `> **Penalidade Total de Qualidade:** \`${totalPenalty} pts\` (cap: 30) | Base: NIST, SonarQube, Microsoft`, "");
        }

        logger.debug(`Quality section rendered in ${Date.now() - start}ms`);
        return lines;
    }

    private _extractValues(breakdown: any, prefix: string, suffix: string): Record<string, number> {
        const map: any = {
            cc: "cc", cog: "cognitive", nest: "nesting", cbo: "cbo",
            dit: "dit", miLow: "miLow", miCrit: "miCritical",
            defect: "defect", gateRed: "gateRed", shadow: "shadow"
        };
        const res: Record<string, number> = {};
        Object.entries(map).forEach(([short, long]) => {
            const key = prefix === "Quality (" ? `${prefix}${this._getQualityKey(short)}${suffix}` : `${prefix}${long}${suffix}`;
            res[short] = breakdown[key] || 0;
        });
        return res;
    }

    private _getQualityKey(short: string): string {
        const keys: any = {
            cc: "CC > 20 - High Risk", cog: "Cognitive > 15", nest: "Nesting > 3",
            cbo: "CBO > 10 - High Coupling", dit: "DIT > 5 - Deep Inheritance",
            miLow: "MI < 10 - Low Maint", miCrit: "MI < 5 - Critical",
            defect: "Defect Density > 1/KLOC", gateRed: "Gate RED", shadow: "Shadow Non-Compliant"
        };
        return keys[short] || short;
    }
}
