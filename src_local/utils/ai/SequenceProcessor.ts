import { Value } from './microgpt_core.ts';
import { ModelOps } from './ModelOps.ts';

/**
 * 🧵 SequenceProcessor — Handles token processing and gpt forward passes.
 */
export class SequenceProcessor {
    static processTokens(
        tokens: number[],
        keys: Value[][][],
        vals: Value[][][],
        gptFn: (tokenId: number, posId: number, k: Value[][][], v: Value[][][]) => Value[]
    ): Value[] {
        const n = tokens.length - 1;
        const losses: Value[] = [];
        for (let i = 0; i < n; i++) {
            const probs = ModelOps.softmax(gptFn(tokens[i]!, i, keys, vals));
            const target = probs[tokens[i + 1]!];
            if (target) losses.push(target.log().neg());
        }
        return losses;
    }

    static calculateAnomaly(
        tokens: number[],
        gptFn: (tokenId: number, posId: number, k: Value[][][], v: Value[][][]) => Value[],
        nLayer: number
    ): number {
        const n = tokens.length - 1;
        const keys: Value[][][] = Array.from({ length: nLayer }, () => []);
        const vals: Value[][][] = Array.from({ length: nLayer }, () => []);
        let totalLoss = 0;
        for (let i = 0; i < n; i++) {
            const probs = ModelOps.softmax(gptFn(tokens[i]!, i, keys, vals));
            const target = probs[tokens[i + 1]!];
            if (target) totalLoss += target.log().neg().data;
        }
        return totalLoss / n;
    }
}
