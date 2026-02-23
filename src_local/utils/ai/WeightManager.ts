import { Value } from './microgpt_core.ts';

/**
 * 📦 WeightManager — Specialized in exporting and importing weights.
 */
export class WeightManager {
    static export(stateDict: Record<string, Value[][]>): Record<string, number[][]> {
        const weights: Record<string, number[][]> = {};
        for (const [key, mat] of Object.entries(stateDict)) {
            weights[key] = mat.map(row => row.map(v => v.data));
        }
        return weights;
    }

    static import(stateDict: Record<string, Value[][]>, weights: Record<string, number[][]>): void {
        for (const [key, matData] of Object.entries(weights)) {
            const target = stateDict[key];
            if (target) {
                this.updateMatrix(target, matData);
            }
        }
    }

    private static updateMatrix(target: Value[][], data: number[][]) {
        data.forEach((rowData, i) => {
            rowData.forEach((val, j) => {
                if (target[i]?.[j]) {
                    target[i]![j]!.data = val;
                    target[i]![j]!.grad = 0;
                }
            });
        });
    }
}
