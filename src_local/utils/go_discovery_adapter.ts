import winston from "winston";

const logger = winston.child({ module: "GoDiscoveryAdapter" });

export interface AtomicUnit {
    type: "class" | "function";
    name: string;
    line: number;
    complexity: number;
    cognitive_complexity: number;
}

export interface FileAnalysis {
    path: string;
    exists: boolean;
    units: AtomicUnit[];
    total_complexity?: number;
    cognitive_complexity?: number;
    max_nesting?: number;
    loc?: number;
    sloc?: number;
    comments?: number;
}

/**
 * 🌉 Adaptador de Descoberta Go (Nível Atômico).
 * Faz a ponte entre o Bun e o motor Go de alta performance.
 */
export class GoDiscoveryAdapter {
    private static readonly HUB_URL = "http://localhost:8080/analyze";

    /**
     * Executa o scan atômico em um diretório ou arquivo.
     * Agora utiliza o Native Sovereign Hub via HTTP.
     */
    static async scan(directory: string, root: string, isLegacy: boolean = false): Promise<{ results: FileAnalysis[], findings: any[] }> {
        try {
            logger.info(`🔍 [GoAdapter] Solicitando análise de projeto via Hub: ${directory}`);
            const startTime = Date.now();

            const url = new URL(this.HUB_URL);
            url.searchParams.set("file", directory);

            const response = await fetch(url.toString());
            if (!response.ok) {
                throw new Error(`Hub returned ${response.status}: ${await response.text()}`);
            }

            const rawResult = await response.json();

            let results: FileAnalysis[] = [];
            if (rawResult) {
                const transform = (item: any): FileAnalysis => ({
                    path: item.path || "unknown",
                    exists: true,
                    units: [],
                    total_complexity: item.cyclomatic_complexity || item.complexity || item.total_complexity || 0,
                    cognitive_complexity: item.cognitive_complexity || 0,
                    loc: item.loc || 0,
                    sloc: item.sloc || 0,
                    comments: item.comments || 0
                });

                if (Array.isArray(rawResult)) {
                    // Filter out any null items before transforming
                    results = rawResult.filter(item => item !== null).map(transform);
                } else if (typeof rawResult === 'object') {
                    results = [transform(rawResult)];
                }
            }

            const duration = Date.now() - startTime;
            logger.info(`✨ [GoAdapter] Análise concluída em ${duration}ms. (${results.length} arquivos)`);

            return { results, findings: [] };
        } catch (error: any) {
            const msg = `🚨 Falha na comunicação com o Hub: ${error.message}`;
            logger.error(msg);
            return {
                results: [],
                findings: [{
                    type: "CRITICAL",
                    severity: "CRITICAL",
                    file: "hub.exe",
                    issue: msg,
                    category: "Infrastructure",
                    context: "GoDiscoveryAdapter"
                }]
            };
        }
    }
}
