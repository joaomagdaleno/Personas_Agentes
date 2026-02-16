/**
 * SISTEMA DE PERSONAS AGENTES - SUPORTE TÉCNICO
 * Módulo: Analista de Contexto Semântico (SemanticContextAnalyst)
 * Função: Identificar a intencionalidade do código (Observabilidade, Definição ou Lógica).
 * Soberania: INTELLIGENCE-AGENT.
 */
import winston from "winston";

const logger = winston.child({ module: "SemanticContextAnalyst" });

export type IntentType = "METADATA" | "OBSERVABILITY" | "LOGIC";
export type ComponentType = "TEST" | "PRODUCTION";

/**
 * 🔍 SemanticContextAnalyst — Classifica a intencionalidade semântica do código.
 *
 * Analisa blocos de código e determina se são:
 * - METADATA: definições técnicas, constantes, configurações
 * - OBSERVABILITY: logging, telemetria, monitoramento
 * - LOGIC: lógica de negócio, fluxo de controle, transformações
 */
export class SemanticContextAnalyst {
    private readonly METADATA_PATTERNS = [
        /^\s*(export\s+)?(const|let|var)\s+[A-Z_]+\s*=/,      // Constantes UPPER_CASE
        /^\s*(export\s+)?(type|interface|enum)\s+/,             // Definições de tipo
        /^\s*\/\*\*[\s\S]*?\*\//,                               // JSDoc/docstrings
        /^\s*(import|from)\s+/,                                 // Imports
        /^\s*@(deprecated|override|abstract)/,                  // Decorators
        /patterns\s*[:=]\s*[\[\{]/,                             // Definições de padrões
        /rules\s*[:=]\s*[\[\{]/,                                // Definições de regras
    ];

    private readonly OBSERVABILITY_PATTERNS = [
        /logger\.(info|warn|warning|error|debug|verbose)/,
        /console\.(log|warn|error|debug|info|trace)/,
        /log_performance/,
        /\.emit\s*\(/,
        /telemetry/i,
        /metrics?\.(increment|gauge|histogram)/,
    ];

    /**
     * 🔍 Classifica a intenção de um bloco de código.
     */
    classifyIntent(codeBlock: string): IntentType {
        if (this._isMetadataContext(codeBlock)) return "METADATA";
        if (this._isObservabilityContext(codeBlock)) return "OBSERVABILITY";
        return "LOGIC";
    }

    /**
     * 📂 Classifica o tipo do componente baseado no caminho.
     */
    mapComponentType(relPath: string): ComponentType {
        const normalized = relPath.replace(/\\/g, "/");
        if (normalized.includes("tests/") || normalized.includes("test_") || normalized.includes(".test.")) {
            return "TEST";
        }
        return "PRODUCTION";
    }

    /**
     * 📊 Analisa um arquivo completo e retorna estatísticas de intenção.
     */
    analyzeFile(content: string, filePath: string): { metadata: number; observability: number; logic: number; total: number } {
        const lines = content.split("\n");
        let metadata = 0, observability = 0, logic = 0;

        // Analisa em blocos de 5 linhas para contexto
        for (let i = 0; i < lines.length; i += 5) {
            const block = lines.slice(i, Math.min(i + 5, lines.length)).join("\n");
            const intent = this.classifyIntent(block);
            if (intent === "METADATA") metadata++;
            else if (intent === "OBSERVABILITY") observability++;
            else logic++;
        }

        const total = metadata + observability + logic;
        logger.debug(`📊 ${filePath}: META=${metadata} OBS=${observability} LOGIC=${logic}`);
        return { metadata, observability, logic, total };
    }

    private _isMetadataContext(block: string): boolean {
        return this.METADATA_PATTERNS.some(p => p.test(block));
    }

    private _isObservabilityContext(block: string): boolean {
        return this.OBSERVABILITY_PATTERNS.some(p => p.test(block));
    }
}
