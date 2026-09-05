import { createZvecGrep, type ZvecGrep, type ZvecGrepContextOptions } from "@zvec/zvec-grep";
import winston from "winston";

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) => `${timestamp} - ZvecGrep - ${level.toUpperCase()} - ${message}`)
  ),
  transports: [new winston.transports.Console()]
});

export interface ZvecGrepSearchResult {
  filePath: string;
  score?: number;
  content: string;
  startLine?: number;
  endLine?: number;
}

/**
 * ZvecGrepEngine
 *
 * Provides native TypeScript integration with @zvec/zvec-grep for zero-latency,
 * local-first hybrid vector + lexical (BM25) + exact (ripgrep) workspace search.
 */
export class ZvecGrepEngine {
  private static instance: ZvecGrepEngine;
  private zgInstance: ZvecGrep | null = null;
  private isInitialized = false;
  private projectRoot: string;

  private constructor(projectRoot: string = process.cwd()) {
    this.projectRoot = projectRoot;
  }

  public static getInstance(projectRoot: string = process.cwd()): ZvecGrepEngine {
    if (!ZvecGrepEngine.instance) {
      ZvecGrepEngine.instance = new ZvecGrepEngine(projectRoot);
    }
    return ZvecGrepEngine.instance;
  }

  /**
   * Initializes the native ZvecGrep engine
   */
  public async initialize(): Promise<boolean> {
    if (this.isInitialized) return true;

    try {
      logger.info(`⚡ [ZvecGrep] Inicializando motor nativo em memória para o diretório: ${this.projectRoot}`);
      this.zgInstance = await createZvecGrep({
        root: this.projectRoot
      });
      this.isInitialized = true;
      logger.info(`✅ [ZvecGrep] Motor nativo ZvecGrep inicializado com sucesso.`);
      return true;
    } catch (error) {
      logger.error(`❌ [ZvecGrep] Erro ao inicializar ZvecGrep nativo: ${error instanceof Error ? error.message : String(error)}`);
      this.isInitialized = false;
      return false;
    }
  }

  /**
   * Checks if zg is initialized
   */
  public isReady(): boolean {
    return this.isInitialized && this.zgInstance !== null;
  }

  /**
   * Executes a hybrid search (semantic + BM25 + ripgrep)
   */
  public async search(query: string, limit: number = 10): Promise<ZvecGrepSearchResult[]> {
    if (!this.isReady()) {
      const ok = await this.initialize();
      if (!ok || !this.zgInstance) {
        logger.warn(`⚠️ [ZvecGrep] Motor não pronto. Retornando busca vazia.`);
        return [];
      }
    }

    try {
      const contextOptions: ZvecGrepContextOptions = {
        query,
        limit,
        rg: true // Habilita ripgrep fallback se o índice não estiver construído
      };

      const contextPromise = this.zgInstance!.context(contextOptions);
      const timeoutPromise = new Promise<any>((resolve) => setTimeout(() => resolve({ items: [] }), 1200));
      const result = await Promise.race([contextPromise, timeoutPromise]);
      const results: ZvecGrepSearchResult[] = [];

      if (result && Array.isArray(result.items)) {
        for (const item of result.items) {
          if (item.file) {
            results.push({
              filePath: item.file.relativePath || item.file.absolutePath || 'desconhecido',
              score: item.score,
              content: item.content || '',
              startLine: item.range?.start?.line,
              endLine: item.range?.end?.line
            });
          }
        }
      }

      logger.info(`🔍 [ZvecGrep] Busca executada para "${query}" - ${results.length} resultados encontrados.`);
      return results;
    } catch (error) {
      logger.error(`❌ [ZvecGrep] Falha na busca por "${query}": ${error instanceof Error ? error.message : String(error)}`);
      return [];
    }
  }

  /**
   * Indexes the workspace
   */
  public async indexWorkspace(): Promise<boolean> {
    if (!this.isReady()) {
      const ok = await this.initialize();
      if (!ok || !this.zgInstance) return false;
    }

    try {
      logger.info(`📂 [ZvecGrep] Indexando espaço de trabalho...`);
      await this.zgInstance!.index();
      logger.info(`✅ [ZvecGrep] Indexação concluída.`);
      return true;
    } catch (error) {
      logger.error(`❌ [ZvecGrep] Erro na indexação: ${error instanceof Error ? error.message : String(error)}`);
      return false;
    }
  }
}
