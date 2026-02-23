import { Value } from './microgpt_core.ts';
import { ModelOps } from './ModelOps.ts';
import { ModelInitializer } from './ModelInitializer.ts';

export class MicroPredictor {
    private vocab: string[];
    public vocabSize: number;
    private stateDict: Record<string, Value[][]>;
    private BOS: number;
    public lastAttentionWeights: number[][][] = []; // [layer][head][seq_pos]

    private readonly N_EMBD = 16;
    private readonly N_HEAD = 4;
    private readonly N_LAYER = 1;
    private readonly BLOCK_SIZE = 16;
    private readonly HEAD_DIM = 16 / 4;

    constructor(uniqueEvents: string[]) {
        this.vocab = [...new Set(uniqueEvents)].sort();
        this.BOS = this.vocab.length;
        this.vocabSize = this.vocab.length + 1;
        this.stateDict = ModelInitializer.initDict(this.vocabSize, this.BLOCK_SIZE, this.N_LAYER, this.N_EMBD);
    }

    private getParams(): Value[] {
        return Object.values(this.stateDict).flatMap((mat) =>
            mat.flatMap((row) => row)
        );
    }

    /**
     * Exports the model weights as a plain JSON object.
     */
    public exportWeights(): Record<string, number[][]> {
        const weights: Record<string, number[][]> = {};
        for (const [key, mat] of Object.entries(this.stateDict)) {
            weights[key] = mat.map(row => row.map(v => v.data));
        }
        return weights;
    }

    /**
     * Imports weights into the current state dictionary.
     */
    public importWeights(weights: Record<string, number[][]>): void {
        for (const [key, matData] of Object.entries(weights)) {
            if (this.stateDict[key]) {
                const targetMat = this.stateDict[key]!;
                matData.forEach((rowData, i) => {
                    rowData.forEach((val, j) => {
                        if (targetMat[i] && targetMat[i][j]) {
                            targetMat[i][j]!.data = val;
                            targetMat[i][j]!.grad = 0;
                        }
                    });
                });
            }
        }
    }

    private gpt(tokenId: number, posId: number, keys: Value[][][], values: Value[][][]): Value[] {
        const tokEmb = this.stateDict["wte"]?.[tokenId];
        const posEmb = this.stateDict["wpe"]?.[posId];
        if (!tokEmb || !posEmb) throw new Error("Missing embeddings");
        let x = ModelOps.rmsnorm(tokEmb.map((t, i) => t.add(posEmb[i]!)));

        for (let li = 0; li < this.N_LAYER; li++) {
            x = this.transformerBlock(li, x, keys, values);
        }
        return ModelOps.linear(x, this.stateDict["lm_head"]!);
    }

    private transformerBlock(li: number, x: Value[], keys: Value[][][], values: Value[][][]): Value[] {
        let xResidual = x;
        x = ModelOps.rmsnorm(x);
        const q = ModelOps.linear(x, this.stateDict[`layer${li}.attn_wq`]!);
        const k = ModelOps.linear(x, this.stateDict[`layer${li}.attn_wk`]!);
        const v = ModelOps.linear(x, this.stateDict[`layer${li}.attn_wv`]!);
        keys[li]!.push(k);
        values[li]!.push(v);

        const xAttn = this.multiHeadAttention(li, q, keys[li]!, values[li]!);
        x = ModelOps.linear(xAttn, this.stateDict[`layer${li}.attn_wo`]!).map((a, i) => a.add(xResidual[i]!));

        xResidual = x;
        x = ModelOps.rmsnorm(x);
        x = ModelOps.linear(x, this.stateDict[`layer${li}.mlp_fc1`]!).map(xi => xi.relu());
        x = ModelOps.linear(x, this.stateDict[`layer${li}.mlp_fc2`]!).map((a, i) => a.add(xResidual[i]!));
        return x;
    }

    private multiHeadAttention(li: number, q: Value[], keys: Value[][], values: Value[][]): Value[] {
        const xAttn: Value[] = [];
        for (let h = 0; h < this.N_HEAD; h++) {
            const hs = h * this.HEAD_DIM;
            const qH = q.slice(hs, hs + this.HEAD_DIM);
            const kH = keys.map((ki) => ki.slice(hs, hs + this.HEAD_DIM));
            const vH = values.map((vi) => vi.slice(hs, hs + this.HEAD_DIM));

            const attnLogits = kH.map((kHt) => Value.matmul(qH, [kHt])[0]!.mul(1 / this.HEAD_DIM ** 0.5));
            const attnWeights = ModelOps.softmax(attnLogits);

            this.captureAttention(li, h, attnWeights);

            for (let j = 0; j < this.HEAD_DIM; j++) {
                xAttn.push(attnWeights.reduce((acc, wt, t) => acc.add(wt.mul(vH[t]![j]!)), new Value(0)));
            }
        }
        return xAttn;
    }

    private captureAttention(li: number, h: number, weights: Value[]) {
        if (!this.lastAttentionWeights[li]) this.lastAttentionWeights[li] = [];
        if (!this.lastAttentionWeights[li]![h]) this.lastAttentionWeights[li]![h] = [];
        this.lastAttentionWeights[li]![h]!.push(...weights.map(v => v.data));
    }

    public train(dataSequences: string[][], steps: number = 200, learningRate: number = 0.01) {
        const params = this.getParams();
        const adam = { m: new Float64Array(params.length), v: new Float64Array(params.length) };
        const rng = ModelInitializer.mulberry32(123);
        const flattenedDocs = dataSequences.map(s => s.filter(e => this.vocab.includes(e)).map(e => this.vocab.indexOf(e))).filter(s => s.length > 0);

        if (flattenedDocs.length === 0) return;

        for (let step = 0; step < steps; step++) {
            const doc = flattenedDocs[Math.floor(rng() * flattenedDocs.length)] ?? [];
            const tokens = [this.BOS, ...doc, this.BOS];
            const n = Math.min(this.BLOCK_SIZE, tokens.length - 1);

            const keys: Value[][][] = Array.from({ length: this.N_LAYER }, () => []);
            const vals: Value[][][] = Array.from({ length: this.N_LAYER }, () => []);
            const losses: Value[] = [];

            for (let posId = 0; posId < n; posId++) {
                const probs = ModelOps.softmax(this.gpt(tokens[posId]!, posId, keys, vals));
                const targetProb = probs[tokens[posId + 1]!];
                if (targetProb) losses.push(targetProb.log().neg());
            }

            losses.reduce((a, b) => a.add(b)).mul(1 / n).backward();
            this.applyAdam(params, adam, step, steps, learningRate);
        }
    }

    private applyAdam(params: Value[], adam: any, step: number, steps: number, lr: number) {
        const lrT = lr * (1 - step / steps);
        for (let i = 0; i < params.length; i++) {
            const p = params[i]!;
            adam.m[i] = 0.85 * adam.m[i] + 0.15 * p.grad;
            adam.v[i] = 0.99 * adam.v[i] + 0.01 * p.grad ** 2;
            const mHat = adam.m[i] / (1 - 0.85 ** (step + 1));
            const vHat = adam.v[i] / (1 - 0.99 ** (step + 1));
            p.data -= lrT * mHat / (Math.sqrt(vHat) + 1e-8);
            p.grad = 0;
        }
    }

    public calculateAnomalyScore(sequence: string[]): number {
        const validEvents = sequence.filter(e => this.vocab.includes(e));
        if (validEvents.length === 0) return 0;

        const tokens = [this.BOS, ...validEvents.map(e => this.vocab.indexOf(e)), this.BOS];
        const n = Math.min(this.BLOCK_SIZE, tokens.length - 1);
        this.lastAttentionWeights = [];
        let totalLoss = 0;
        const keys: Value[][][] = Array.from({ length: this.N_LAYER }, () => []);
        const vals: Value[][][] = Array.from({ length: this.N_LAYER }, () => []);

        for (let posId = 0; posId < n; posId++) {
            const probs = ModelOps.softmax(this.gpt(tokens[posId]!, posId, keys, vals));
            const targetProb = probs[tokens[posId + 1]!];
            if (targetProb !== undefined) totalLoss += targetProb.log().neg().data;
        }
        return totalLoss / n;
    }
}
