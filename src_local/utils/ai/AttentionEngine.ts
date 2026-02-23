import { Value } from './microgpt_core.ts';
import { ModelOps } from './ModelOps.ts';

/**
 * 🔍 AttentionEngine — Specialized in multi-head attention logic.
 */
export class AttentionEngine {
    static multiHead(li: number, q: Value[], keys: Value[][], values: Value[][], nHead: number, headDim: number, lastWeights: number[][][]): Value[] {
        const xAttn: Value[] = [];
        for (let h = 0; h < nHead; h++) {
            const hs = h * headDim;
            const qH = q.slice(hs, hs + headDim);
            const kH = keys.map((ki) => ki.slice(hs, hs + headDim));
            const vH = values.map((vi) => vi.slice(hs, hs + headDim));

            const logits = kH.map((kHt) => Value.matmul(qH, [kHt])[0]!.mul(1 / headDim ** 0.5));
            const weights = ModelOps.softmax(logits);

            this.capture(li, h, weights, lastWeights);

            for (let j = 0; j < headDim; j++) {
                xAttn.push(weights.reduce((acc, wt, t) => acc.add(wt.mul(vH[t]![j]!)), new Value(0)));
            }
        }
        return xAttn;
    }

    private static capture(li: number, h: number, weights: Value[], lastWeights: number[][][]) {
        if (!lastWeights[li]) lastWeights[li] = [];
        if (!lastWeights[li]![h]) lastWeights[li]![h] = [];
        lastWeights[li]![h]!.push(...weights.map(v => v.data));
    }
}
