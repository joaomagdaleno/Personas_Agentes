import winston from 'winston';
import { HubManagerGRPC } from "../../../core/hub_manager_grpc.ts";

export interface DeobfuscationResult {
    original: string;
    cleaned: string;
    line: number;
}

/**
 * 🧹 ObfuscationCleanerEngine (Deep Version)
 * Engine responsável por reconstruir strings ofuscadas em literais claros via gRPC Hub.
 */
export class ObfuscationCleanerEngine {
    private logger = winston.loggers.get('default_logger') || winston;

    constructor(private hubManager?: HubManagerGRPC) {}

    /**
     * Identifica e reconstrói strings ofuscadas usando o motor profundo do Rust.
     */
    public async collectReplacementsDeep(filePath: string, content: string): Promise<DeobfuscationResult[]> {
        if (!this.hubManager) return [];

        try {
            const analysis = await this.hubManager.analyzeFile(filePath, content);
            if (!analysis || !analysis.findings) return [];

            const obfuscationFindings = analysis.findings.filter((f: any) => f.category === "OBFUSCATION");
            if (obfuscationFindings.length === 0) return [];

            const results: DeobfuscationResult[] = [];
            for (const finding of obfuscationFindings) {
                const cleaned = await this.deobfuscateViaHub(finding.snippet);
                if (cleaned && cleaned !== finding.snippet) {
                    results.push({
                        original: finding.snippet,
                        cleaned: cleaned,
                        line: finding.line
                    });
                }
            }
            return results;
        } catch (e) {
            this.logger.error(`❌ [Cleaner] Erro na coleta profunda de ofuscação: ${e}`);
            return [];
        }
    }

    private async deobfuscateViaHub(snippet: string): Promise<string | null> {
        if (!this.hubManager) return null;
        const prompt = `De-obfuscate the following string or expression into its clear, literal version. Return ONLY the string literal, no explanation, no markdown.
        Snippet: ${snippet}`;
        
        try {
            const result = await this.hubManager.reason(prompt);
            return result ? result.trim() : null;
        } catch {
            return null;
        }
    }

    /**
     * Aplica as substituições no conteúdo do arquivo.
     */
    public applyClean(content: string, replacements: DeobfuscationResult[]): string {
        let newContent = content;
        for (const r of replacements) {
            newContent = newContent.replace(r.original, r.cleaned);
        }
        return newContent;
    }
}
