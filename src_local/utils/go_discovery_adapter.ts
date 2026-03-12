import winston from "winston";
import { HubManagerGRPC } from "../core/hub_manager_grpc.ts";

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
 * Faz a ponte entre o Bun e o motor Go de alta performance via gRPC.
 */
export class GoDiscoveryAdapter {
    /**
     * Executa o scan atômico em um diretório ou arquivo.
     * Agora utiliza o HubManagerGRPC para comunicação segura e performática.
     */
    static async scan(directory: string, root: string, hubManager?: HubManagerGRPC): Promise<{ results: FileAnalysis[], findings: any[] }> {
        try {
            if (!hubManager) {
                logger.warn("⚠️ HubManager não fornecido ao GoAdapter. Retornando vazio.");
                return { results: [], findings: [] };
            }

            logger.info(`🔍 [GoAdapter] Solicitando análise de projeto via gRPC Hub: ${directory}`);
            const startTime = Date.now();

            const files = await hubManager.scanProject(directory, root);
            
            const results: FileAnalysis[] = (files || []).map((item: any) => ({
                path: item.path || "unknown",
                exists: true,
                units: [],
                total_complexity: item.cyclomaticComplexity || item.total_complexity || 0,
                cognitive_complexity: item.cognitiveComplexity || 0,
                loc: item.loc || 0,
                sloc: item.sloc || 0,
                comments: item.comments || 0
            }));

            const duration = Date.now() - startTime;
            logger.info(`✨ [GoAdapter] Análise gRPC concluída em ${duration}ms. (${results.length} arquivos)`);

            return { results, findings: [] };
        } catch (error: any) {
            const msg = `🚨 Falha na comunicação gRPC com o Hub: ${error.message}`;
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
