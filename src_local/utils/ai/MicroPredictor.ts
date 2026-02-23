import { Value } from './microgpt_core.ts';
import { ModelOps } from './ModelOps.ts';
import { ModelInitializer } from './ModelInitializer.ts';
import { Optimizer } from './Optimizer.ts';
import { SequenceProcessor } from './SequenceProcessor.ts';
import { GPTLayer } from './GPTLayer.ts';
import { WeightManager } from './WeightManager.ts';

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
        return WeightManager.export(this.stateDict);
    }

    /**
     * Imports weights into the current state dictionary.
     */
    public importWeights(weights: Record<string, number[][]>): void {
        WeightManager.import(this.stateDict, weights);
    }

    private gpt(tokenId: number, posId: number, keys: Value[][][], values: Value[][][]): Value[] {
        const tokEmb = this.stateDict["wte"]?.[tokenId];
        const posEmb = this.stateDict["wpe"]?.[posId];
        if (!tokEmb || !posEmb) throw new Error("Missing embeddings");
        let x = ModelOps.rmsnorm(tokEmb.map((t, i) => t.add(posEmb[i]!)));

        for (let li = 0; li < this.N_LAYER; li++) {
            x = GPTLayer.transformerBlock(li, x, this.stateDict, keys, values, this.N_HEAD, this.HEAD_DIM, this.lastAttentionWeights);
        }
        return ModelOps.linear(x, this.stateDict["lm_head"]!);
    }

    public train(dataSequences: string[][], steps: number = 200, learningRate: number = 0.01) {
        const params = this.getParams();
        const adam = { m: new Float64Array(params.length), v: new Float64Array(params.length) };
        const rng = ModelInitializer.mulberry32(123);
        const docs = dataSequences.map(s => s.filter(e => this.vocab.includes(e)).map(e => this.vocab.indexOf(e))).filter(s => s.length > 0);

        if (docs.length === 0) return;

        for (let step = 0; step < steps; step++) {
            const doc = docs[Math.floor(rng() * docs.length)] ?? [];
            const tokens = [this.BOS, ...doc.slice(0, this.BLOCK_SIZE - 1), this.BOS];
            const keys: Value[][][] = Array.from({ length: this.N_LAYER }, () => []);
            const vals: Value[][][] = Array.from({ length: this.N_LAYER }, () => []);

            const losses = SequenceProcessor.processTokens(tokens, keys, vals, this.gpt.bind(this));
            if (losses.length > 0) {
                losses.reduce((a, b) => a.add(b)).mul(1 / losses.length).backward();
                Optimizer.applyAdam(params, adam, step, steps, learningRate);
            }
        }
    }

    public calculateAnomalyScore(sequence: string[]): number {
        const valid = sequence.filter(e => this.vocab.includes(e));
        if (valid.length === 0) return 0;

        const tokens = [this.BOS, ...valid.slice(0, this.BLOCK_SIZE - 1).map(e => this.vocab.indexOf(e)), this.BOS];
        this.lastAttentionWeights = [];
        return SequenceProcessor.calculateAnomaly(tokens, this.gpt.bind(this), this.N_LAYER);
    }
}
