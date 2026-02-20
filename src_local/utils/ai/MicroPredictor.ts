import { Value } from './microgpt_core.js';

export class MicroPredictor {
    private vocab: string[];
    public vocabSize: number;
    private stateDict: Record<string, Value[][]>;
    private BOS: number;
    public lastAttentionWeights: number[][][] = []; // [layer][head][seq_pos]

    // Hyperparameters
    private readonly N_EMBD = 16;
    private readonly N_HEAD = 4;
    private readonly N_LAYER = 1;
    private readonly BLOCK_SIZE = 16;
    private readonly HEAD_DIM = 16 / 4; // N_EMBD / N_HEAD

    constructor(uniqueEvents: string[]) {
        this.vocab = [...new Set(uniqueEvents)].sort();
        this.BOS = this.vocab.length;
        this.vocabSize = this.vocab.length + 1;
        this.stateDict = this.initModel();
    }

    // ---- Seeded PRNG (Mulberry32) for deterministic initialization ----
    private mulberry32(seed: number): () => number {
        let s = seed | 0;
        return () => {
            s = (s + 0x6d2b79f5) | 0;
            let t = Math.imul(s ^ (s >>> 15), 1 | s);
            t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
    }

    private gauss(rng: () => number, mean: number, std: number): number {
        const u1 = rng();
        const u2 = rng();
        return mean + std * Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    }

    private shuffle<T>(rng: () => number, arr: T[]): void {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(rng() * (i + 1));
            const tempI = arr[i];
            const tempJ = arr[j];
            if (tempI !== undefined && tempJ !== undefined) {
                arr[i] = tempJ;
                arr[j] = tempI;
            }
        }
    }

    // ---- Model layers ----
    private linear(x: Value[], w: Value[][]): Value[] {
        return Value.matmul(x, w);
    }

    private softmax(logits: Value[]): Value[] {
        const maxVal = Math.max(...logits.map((v) => v.data));
        const exps = logits.map((v) => v.sub(maxVal).exp());
        const total = exps.reduce((a, b) => a.add(b));
        return exps.map((e) => e.div(total));
    }

    private rmsnorm(x: Value[]): Value[] {
        const ms = x
            .reduce((acc, xi) => acc.add(xi.mul(xi)), new Value(0))
            .div(x.length);
        const scale = ms.add(1e-5).pow(-0.5);
        return x.map((xi) => xi.mul(scale));
    }

    private initModel(): Record<string, Value[][]> {
        const rng = this.mulberry32(42);
        const gaussFn = (mean: number, std: number) => this.gauss(rng, mean, std);

        function matrix(nout: number, nin: number, std = 0.08): Value[][] {
            return Array.from(
                { length: nout },
                () => Array.from({ length: nin }, () => new Value(gaussFn(0, std))),
            );
        }

        const dict: Record<string, Value[][]> = {
            wte: matrix(this.vocabSize, this.N_EMBD),
            wpe: matrix(this.BLOCK_SIZE, this.N_EMBD),
            lm_head: matrix(this.vocabSize, this.N_EMBD),
        };

        for (let i = 0; i < this.N_LAYER; i++) {
            dict[`layer${i}.attn_wq`] = matrix(this.N_EMBD, this.N_EMBD);
            dict[`layer${i}.attn_wk`] = matrix(this.N_EMBD, this.N_EMBD);
            dict[`layer${i}.attn_wv`] = matrix(this.N_EMBD, this.N_EMBD);
            dict[`layer${i}.attn_wo`] = matrix(this.N_EMBD, this.N_EMBD);
            dict[`layer${i}.mlp_fc1`] = matrix(4 * this.N_EMBD, this.N_EMBD);
            dict[`layer${i}.mlp_fc2`] = matrix(this.N_EMBD, 4 * this.N_EMBD);
        }
        return dict;
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

    private gpt(
        tokenId: number,
        posId: number,
        keys: Value[][][],
        values: Value[][][],
    ): Value[] {
        const tokEmb = this.stateDict["wte"]?.[tokenId];
        const posEmb = this.stateDict["wpe"]?.[posId];
        if (!tokEmb || !posEmb) throw new Error("Missing embeddings");
        let x = tokEmb.map((t, i) => t.add(posEmb[i]!));
        x = this.rmsnorm(x);

        for (let li = 0; li < this.N_LAYER; li++) {
            let xResidual = x;
            x = this.rmsnorm(x);
            const q = this.linear(x, this.stateDict[`layer${li}.attn_wq`]!);
            const k = this.linear(x, this.stateDict[`layer${li}.attn_wk`]!);
            const v = this.linear(x, this.stateDict[`layer${li}.attn_wv`]!);
            keys[li]!.push(k);
            values[li]!.push(v);

            const xAttn: Value[] = [];
            for (let h = 0; h < this.N_HEAD; h++) {
                const hs = h * this.HEAD_DIM;
                const qH = q.slice(hs, hs + this.HEAD_DIM);
                const kH = keys[li]!.map((ki) => ki.slice(hs, hs + this.HEAD_DIM));
                const vH = values[li]!.map((vi) => vi.slice(hs, hs + this.HEAD_DIM));

                const attnLogits = kH.map((kHt) =>
                    Value.matmul(qH, [kHt])[0]!.mul(1 / this.HEAD_DIM ** 0.5)
                );
                const attnWeights = this.softmax(attnLogits);

                // Capture attention weights for visualization
                if (!this.lastAttentionWeights[li]) this.lastAttentionWeights[li] = [];
                if (!this.lastAttentionWeights[li]![h]) this.lastAttentionWeights[li]![h] = [];
                this.lastAttentionWeights[li]![h]!.push(...attnWeights.map(v => v.data));

                for (let j = 0; j < this.HEAD_DIM; j++) {
                    xAttn.push(
                        attnWeights.reduce(
                            (acc, wt, t) => acc.add(wt.mul(vH[t]![j]!)),
                            new Value(0),
                        ),
                    );
                }
            }

            x = this.linear(xAttn, this.stateDict[`layer${li}.attn_wo`]!);
            x = x.map((a, i) => a.add(xResidual[i]!));

            xResidual = x;
            x = this.rmsnorm(x);
            x = this.linear(x, this.stateDict[`layer${li}.mlp_fc1`]!);
            x = x.map((xi) => xi.relu());
            x = this.linear(x, this.stateDict[`layer${li}.mlp_fc2`]!);
            x = x.map((a, i) => a.add(xResidual[i]!));
        }

        return this.linear(x, this.stateDict["lm_head"]!);
    }

    public train(dataSequences: string[][], steps: number = 200, learningRate: number = 0.01) {
        const params = this.getParams();
        const beta1 = 0.85;
        const beta2 = 0.99;
        const epsAdam = 1e-8;
        const m = new Float64Array(params.length);
        const v = new Float64Array(params.length);

        const rng = this.mulberry32(123); // keep training consistent for tests
        const flattenedDocs = dataSequences.map(seq => {
            // Filter out unknown events just in case
            return seq.filter(e => this.vocab.includes(e)).map(e => this.vocab.indexOf(e));
        }).filter(s => s.length > 0);

        if (flattenedDocs.length === 0) return;

        for (let step = 0; step < steps; step++) {
            // Randomly pick a sequence
            const docIdx = Math.floor(rng() * flattenedDocs.length);
            const doc = flattenedDocs[docIdx] ?? [];

            const tokens = [this.BOS, ...doc, this.BOS];
            const n = Math.min(this.BLOCK_SIZE, tokens.length - 1);

            const ObjectKeys: Value[][][] = Array.from({ length: this.N_LAYER }, () => []);
            const ObjectVals: Value[][][] = Array.from({ length: this.N_LAYER }, () => []);
            const losses: Value[] = [];

            for (let posId = 0; posId < n; posId++) {
                const tokenId = tokens[posId]!;
                const targetId = tokens[posId + 1]!;
                const logits = this.gpt(tokenId, posId, ObjectKeys, ObjectVals);
                const probs = this.softmax(logits);

                const targetProb = probs[targetId];
                if (targetProb) {
                    losses.push(targetProb.log().neg());
                }
            }

            const loss = losses.reduce((a, b) => a.add(b)).mul(1 / n);
            loss.backward();

            const lrT = learningRate * (1 - step / steps);
            for (let i = 0; i < params.length; i++) {
                const p = params[i]!;
                m[i] = beta1 * m[i]! + (1 - beta1) * p.grad;
                v[i] = beta2 * v[i]! + (1 - beta2) * p.grad ** 2;
                const mHat = m[i]! / (1 - beta1 ** (step + 1));
                const vHat = v[i]! / (1 - beta2 ** (step + 1));
                p.data -= lrT * mHat / (Math.sqrt(vHat) + epsAdam);
                p.grad = 0;
            }
        }
    }

    public calculateAnomalyScore(sequence: string[]): number {
        const validEvents = sequence.filter(e => this.vocab.includes(e));
        if (validEvents.length === 0) return 0; // If nothing is recognizable, no sequence modeled

        const tokens = [this.BOS, ...validEvents.map(e => this.vocab.indexOf(e)), this.BOS];
        const n = Math.min(this.BLOCK_SIZE, tokens.length - 1);

        this.lastAttentionWeights = []; // Clear previous capture
        let totalLoss = 0;
        const ObjectKeys: Value[][][] = Array.from({ length: this.N_LAYER }, () => []);
        const ObjectVals: Value[][][] = Array.from({ length: this.N_LAYER }, () => []);

        for (let posId = 0; posId < n; posId++) {
            const tokenId = tokens[posId]!;
            const targetId = tokens[posId + 1]!;
            const logits = this.gpt(tokenId, posId, ObjectKeys, ObjectVals);
            const probs = this.softmax(logits);

            const targetProb = probs[targetId];
            if (targetProb !== undefined) {
                totalLoss += targetProb.log().neg().data;
            }
        }

        return totalLoss / n;
    }
}
