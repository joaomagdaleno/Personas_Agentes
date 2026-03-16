import winston from 'winston';

/**
 * Assistente Técnico: Auditor de Distribuição de Testes (Pirâmide) 📐
 */
export class PyramidAnalyst {
    /**
     * Classifica os testes entre Unit, Integration e E2E.
     */
    async analyze(mapData: Record<string, any>, readFunc: (path: string) => Promise<string | null>): Promise<any> {
        winston.debug("Analysing test pyramid distribution...");
        const pyramid = { unit: 0, integration: 0, e2e: 0, total: 0 };

        for (const file of Object.keys(mapData)) {
            if (!file.includes("tests/")) continue;

            const content = await readFunc(file);
            if (!content) continue;

            pyramid.total += 1;
            if (content.includes("mock") || content.includes("patch")) {
                pyramid.integration += 1;
            } else if (content.includes("selenium") || content.includes("integration_test")) {
                pyramid.e2e += 1;
            } else {
                pyramid.unit += 1;
            }
        }

        return pyramid;
    }
}
