/**
 * 🔍 TestDiscoveryStrategy — specialized in correlating tests with source modules.
 */
export class TestDiscoveryStrategy {
    /**
     * Tenta encontrar o arquivo de teste para um módulo.
     */
    static findTestForModule(moduleName: string, mapData: Record<string, any>): any | null {
        const lowerName = moduleName.toLowerCase();
        for (const [file, info] of Object.entries(mapData)) {
            if (info.component_type === "TEST") {
                // Check if filename contains the module name
                if (file.toLowerCase().includes(lowerName)) {
                    return info;
                }
            }
        }
        return null;
    }
}
