import winston from "winston";

const logger = winston.child({ module: "VitalsSection" });

/**
 * 🩺 VitalsSection — Specialist in health vitals rendering.
 */
export class VitalsSection {
    render(healthData: any, infraLabel: string, infraStatus: string): string {
        const start = Date.now();
        const blindCount = (healthData.dark_matter || []).length;
        const brittleCount = (healthData.brittle_points || []).length;

        let blindImpact = "🟢 `SEGURO`";
        if (blindCount > 0 && blindCount < 10) blindImpact = "🟡 `ALERTA`";
        else if (blindCount >= 10) blindImpact = "🔴 `CRÍTICO`";

        const brittleImpact = brittleCount === 0 ? "🟢 `ESTÁVEL`" : "🔴 `RISCO`";

        const result = [
            "> | Métrica | Valor | Status |",
            "> | :--- | :--- | :--- |",
            `> | Pontos Cegos | ${blindCount} Arq. | ${blindImpact} |`,
            `> | Fragilidades | ${brittleCount} Pts. | ${brittleImpact} |`,
            `> | ${infraLabel} | ${infraStatus} | ⚙️ \`SISTEMA\` |`,
            "",
        ].join("\n");

        logger.debug(`Vitals section rendered in ${Date.now() - start}ms`);
        return result;
    }
}
