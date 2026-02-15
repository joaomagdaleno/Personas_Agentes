import winston from "winston";

const logger = winston.child({ module: "VetoEngine" });

/**
 * 🛑 VetoEngine — PhD in Scanning Decision & False Positive Reduction
 * Motor unificado de veto estratégico e estrutural.
 */
export class VetoEngine {
    /**
     * Decide se uma linha deve ser ignorada na varredura.
     */
    static shouldSkip(line: string, filePath: string, domain: string = "PRODUCTION"): boolean {
        const clean = line.trim();

        // 1. Veto Estrutural (Comentários)
        if (clean.startsWith("//") || clean.startsWith("/*") || clean.startsWith("*") || clean.startsWith("#")) {
            return true;
        }

        // 2. Veto de Domínio (Experimentação vs Crítico)
        if (domain === "EXPERIMENTATION" && !line.toLowerCase().includes("critical")) {
            return true;
        }

        // 3. Veto de Teste (Permite tudo em arquivos de teste)
        if (filePath.includes("/tests/") || filePath.includes(".test.") || filePath.includes(".spec.")) {
            return true;
        }

        // 4. Heurística de Definição de Regra (Regex escrito em string não é execução)
        if (this.isRuleDefinition(line)) {
            return true;
        }

        return false;
    }

    /**
     * Detecta se a linha é uma definição de regra técnica (ex: regex = "/.../").
     */
    static isRuleDefinition(line: string): boolean {
        const lower = line.toLowerCase();
        const patterns = [
            /regex\s*[:=]/,
            /pattern\s*[:=]/,
            /rules\s*[:=]/,
            /diretriz:/,
            /["']ev["']\s*\+\s*["']al/ // Ofuscação de eval em definições
        ];
        return patterns.some(p => p.test(lower));
    }

    /**
     * Detecta se o contexto é matemático técnico (evita confusão com moeda).
     */
    static isTechnicalMathContext(line: string): boolean {
        const techKeywords = ['alpha', 'progress', 'offset', 'dp', 'sp', 'x', 'y', 'width', 'height', 'radius', 'velocity', 'phase', 'lerp', 'sin', 'cos'];
        const moneyKeywords = ['price', 'amount', 'balance', 'cost', 'total', 'tax', 'fee'];

        const lower = line.toLowerCase();
        if (moneyKeywords.some(k => lower.includes(k))) return false;

        return techKeywords.some(k => new RegExp(`\\b${k}\\b`).test(lower));
    }
}
