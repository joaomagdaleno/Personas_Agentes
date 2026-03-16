import { CalcHelpers } from "./CalcHelpers.ts";

/**
 * 🧮 AdjustmentCalculator - PhD in Statistical Synthesis
 */
export class AdjustmentCalculator {
    static calculate(matrix: any[], mapData: any, _caps: any): any {
        const s = { cc: 0, cog: 0, nest: 0, cbo: 0, dit: 0, miL: 0, miC: 0, def: 0, red: 0, shad: 0, total: matrix.length, shallow: 0 };
        matrix.forEach(item => CalcHelpers.aggregate(item, mapData, s));
        return s;
    }
}
