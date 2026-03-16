/**
 * 📐 HalsteadAnalyst — Specialized in Halstead Metrics.
 */
export class HalsteadAnalyst {
    static calculate(content: string): { volume: number; difficulty: number; effort: number } {
        const operators = content.match(/[+\-*/%=<>!&|^~?:]+|&&|\|\||\.\.\.|\?\./g) || [];
        const uniqueOperators = new Set(operators);

        const operands = content.match(/\b[a-zA-Z_]\w*\b/g) || [];
        const uniqueOperands = new Set(operands);

        const n1 = uniqueOperators.size;
        const n2 = uniqueOperands.size;
        const N1 = operators.length;
        const N2 = operands.length;

        const totalUnique = n1 + n2;
        const volume = totalUnique > 0 ? totalUnique * Math.log2(totalUnique) : 0;
        const difficulty = n1 > 0 ? (n1 / 2) * (N2 / Math.max(1, n2)) : 0;
        const effort = volume * difficulty;

        return { volume, difficulty, effort };
    }
}
