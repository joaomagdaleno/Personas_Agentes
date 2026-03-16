import winston from "winston";

const logger = winston.child({ module: "CognitiveAnalyst" });

/**
 * 🧠 Assistente cognitivo para análise de intenção e discrepâncias (Bun Version).
 * Utiliza o CognitiveEngine para verificar se o código cumpre sua intenção declarada.
 */
export class CognitiveAnalyst {
    /**
     * Audita se o código de um arquivo é condizente com sua docstring/propósito.
     */
    static async analyzeIntent(filename: string, content: string, orchestrator: any): Promise<any | null> {
        // Extrai docstring (heurística simples para TS/Python)
        const docstring = CognitiveAnalyst.extractDocstring(content);
        if (!docstring || docstring.length < 10) return null;

        const prompt = CognitiveAnalyst.buildPrompt(filename, docstring, content);

        try {
            const res = await orchestrator.contextEngine.cognitiveReason(prompt);
            if (!res) return null;

            const match = res.match(/\{.*\}/s);
            if (!match || !match[0]) {
                logger.warn(`⚠️ Resposta da IA para ${filename} não contém JSON válido.`);
                return null;
            }

            const data = JSON.parse(match[0]);
            if (!data.consistent) {
                return {
                    file: filename,
                    line: 1,
                    severity: data.severity || "MEDIUM",
                    issue: `Desvio de Intenção: ${data.issue}`,
                    context: "CognitiveIntent"
                };
            }
        } catch (e) {
            logger.error(`❌ Falha na análise cognitiva de ${filename}: ${e}`);
        }
        return null;
    }

    private static extractDocstring(content: string): string | null {
        // Python style
        const pyMatch = content.match(/^(?:'''|""")(.*?)(?:'''|""")/s);
        if (pyMatch && pyMatch[1]) return pyMatch[1].trim();

        // TS/JS style (JSDoc at top)
        const tsMatch = content.match(/^\/\*\*[\s\S]*?\*\//);
        if (tsMatch && tsMatch[0]) return tsMatch[0].replace(/\/\*\*|\*\/|\*/g, "").trim();

        return null;
    }

    private static buildPrompt(filename: string, doc: string, code: string): string {
        return `Audite se o código abaixo cumpre sua docstring.
ARQUIVO: ${filename}
DOCSTRING: "${doc}"
CÓDIGO (Resumo): ${code.slice(0, 2000)}
RESPONDA EM JSON: {"consistent": true/false, "issue": "...", "severity": "..."}`;
    }
}
