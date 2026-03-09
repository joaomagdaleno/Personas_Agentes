import winston from "winston";

/**
 * 🩺 DiagnosticHelpers - PhD in Systemic Health Analysis
 */
export class DiagnosticHelpers {
    static async loadProjectMap(mapPath: string, logger: winston.Logger) {
        if (!await Bun.file(mapPath).exists()) {
            logger.info("ℹ️ Mapa de paridade ausente.");
            return;
        }
        try {
            const data = await Bun.file(mapPath).json();
            const scored = (data.sovereign || []).filter((f: any) => f.parity !== undefined);
            if (scored.length > 0) {
                const avg = Math.round(scored.reduce((acc: number, f: any) => acc + (f.parity || 0), 0) / scored.length);
                logger.info(`🗺️ Mapa Carregado: ${data.sovereign.length} arquivos. Paridade: ${avg}%`);
            }
        } catch { logger.warn("⚠️ Falha ao ler mapa."); }
    }

    static logSession(args: any, logger: winston.Logger, root: string) {
        logger.info(`📡 Acionando Autoconsciência sobre: ${root}`);
        if (args.values["dry-run"]) logger.info("🛡️ MODO DRY-RUN: Simulação ativa.");
        if (args.values.staged) logger.info("📦 MODO INCREMENTAL: Apenas arquivos staged.");
    }
}
