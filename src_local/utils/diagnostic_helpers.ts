import winston from "winston";

interface SovereignMapFile {
    parity?: number;
    [key: string]: unknown;
}

interface SovereignMap {
    sovereign: SovereignMapFile[];
}

/**
 * 🩺 DiagnosticHelpers - PhD in Systemic Health Analysis
 */
export class DiagnosticHelpers {
    static async loadProjectMap(mapPath: string, logger: winston.Logger): Promise<void> {
        if (!await Bun.file(mapPath).exists()) {
            logger.info("ℹ️ Mapa de paridade ausente.");
            return;
        }
        try {
            const data = await Bun.file(mapPath).json() as SovereignMap;
            const scored = (data.sovereign || []).filter(f => f.parity !== undefined);
            if (scored.length > 0) {
                const totalParity = scored.reduce((acc, f) => acc + (f.parity || 0), 0);
                const avg = Math.round(totalParity / scored.length);
                logger.info(`🗺️ Mapa Carregado: ${data.sovereign.length} arquivos. Paridade: ${avg}%`);
            }
        } catch (e: unknown) { 
            logger.warn(`⚠️ Falha ao ler mapa: ${e instanceof Error ? e.message : String(e)}`); 
        }
    }

    static logSession(args: any, logger: winston.Logger, root: string): void {
        logger.info(`📡 Acionando Autoconsciência sobre: ${root}`);
        if (args?.values?.["dry-run"]) logger.info("🛡️ MODO DRY-RUN: Simulação ativa.");
        if (args?.values?.staged) logger.info("📦 MODO INCREMENTAL: Apenas arquivos staged.");
    }
}
