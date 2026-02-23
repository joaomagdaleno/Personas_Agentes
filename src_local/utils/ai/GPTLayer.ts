import { Value } from './microgpt_core.ts';
import { ModelOps } from './ModelOps.ts';
import { AttentionEngine } from './AttentionEngine.ts';

/**
 * 🧱 GPTLayer — Specialized in the transformer block logic.
 */
export class GPTLayer {
    static transformerBlock(
        li: number,
        x: Value[],
        stateDict: Record<string, Value[][]>,
        keys: Value[][][],
        values: Value[][][],
        nHead: number,
        headDim: number,
        lastAttentionWeights: number[][][]
    ): Value[] {
        let xResidual = x;
        x = ModelOps.rmsnorm(x);

        const q = ModelOps.linear(x, stateDict[`layer${li}.attn_wq`]!);
        const k = ModelOps.linear(x, stateDict[`layer${li}.attn_wk`]!);
        const v = ModelOps.linear(x, stateDict[`layer${li}.attn_wv`]!);

        keys[li]!.push(k);
        values[li]!.push(v);

        const xAttn = AttentionEngine.multiHead(li, q, keys[li]!, values[li]!, nHead, headDim, lastAttentionWeights);
        x = ModelOps.linear(xAttn, stateDict[`layer${li}.attn_wo`]!).map((a, i) => a.add(xResidual[i]!));

        xResidual = x;
        x = ModelOps.rmsnorm(x);
        x = ModelOps.linear(x, stateDict[`layer${li}.mlp_fc1`]!).map(xi => xi.relu());
        x = ModelOps.linear(x, stateDict[`layer${li}.mlp_fc2`]!).map((a, i) => a.add(xResidual[i]!));
        return x;
    }
}
