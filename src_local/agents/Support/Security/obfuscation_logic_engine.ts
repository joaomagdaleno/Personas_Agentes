import { DANGEROUS_KEYWORDS } from "./safety_definitions";
import winston from 'winston';

/**
 * 🕵️ Motor de Lógica de Ofuscação (ObfuscationLogicEngine)
 * Resolve recursivamente concatenações e detecta palavras perigosas ocultas.
 */
export class ObfuscationLogicEngine {
    private logger = winston.loggers.get('default_logger') || winston;

    /**
     * Resolve strings concatenadas a partir de fragmentos.
     * Esta é uma implementação simplificada que deve ser usada com análise AST.
     */
    resolveConstant(node: any): string | null {
        if (node.type === 'StringLiteral' || node.type === 'Literal') {
            return node.value;
        }
        if (node.type === 'BinaryExpression' && node.operator === '+') {
            const left = this.resolveConstant(node.left);
            const right = this.resolveConstant(node.right);
            if (left !== null && right !== null) {
                return left + right;
            }
        }
        return null;
    }

    /**
     * Verifica se a string resolvida contém palavras perigosas fragmentadas.
     */
    checkDangerousKeywords(line: number, resolved: string, node: any): any | null {
        for (const kw of DANGEROUS_KEYWORDS) {
            if (resolved.includes(kw) && this.isFragmented(node, kw)) {
                return {
                    line: line,
                    evidence: "Concatenação Suspeita",
                    reconstruction: resolved,
                    keyword: kw
                };
            }
        }
        return null;
    }

    private isFragmented(node: any, kw: string): boolean {
        const left = this.resolveConstant(node.left);
        const right = this.resolveConstant(node.right);

        // Se a keyword está inteira em um dos lados, não é ofuscação por fragmentação
        if (left?.includes(kw) || right?.includes(kw)) {
            return false;
        }
        return true;
    }
}
