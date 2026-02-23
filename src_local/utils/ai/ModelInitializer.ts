import { Value } from './microgpt_core.ts';

/**
 * 🎲 ModelInitializer — Seeded random and weight initialization.
 */
export class ModelInitializer {
    static mulberry32(seed: number): () => number {
        let s = seed | 0;
        return () => {
            s = (s + 0x6d2b79f5) | 0;
            let t = Math.imul(s ^ (s >>> 15), 1 | s);
            t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
    }

    static gauss(rng: () => number, mean: number, std: number): number {
        const u1 = rng();
        const u2 = rng();
        return mean + std * Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    }

    static createMatrix(nout: number, nin: number, rng: () => number, std = 0.08): Value[][] {
        return Array.from(
            { length: nout },
            () => Array.from({ length: nin }, () => new Value(this.gauss(rng, 0, std))),
        );
    }

    static initDict(vocabSize: number, blockSize: number, nLayer: number, nEmbd: number): Record<string, Value[][]> {
        const rng = this.mulberry32(42);
        const dict: Record<string, Value[][]> = {
            wte: this.createMatrix(vocabSize, nEmbd, rng),
            wpe: this.createMatrix(blockSize, nEmbd, rng),
            lm_head: this.createMatrix(vocabSize, nEmbd, rng),
        };

        for (let i = 0; i < nLayer; i++) {
            dict[`layer${i}.attn_wq`] = this.createMatrix(nEmbd, nEmbd, rng);
            dict[`layer${i}.attn_wk`] = this.createMatrix(nEmbd, nEmbd, rng);
            dict[`layer${i}.attn_wv`] = this.createMatrix(nEmbd, nEmbd, rng);
            dict[`layer${i}.attn_wo`] = this.createMatrix(nEmbd, nEmbd, rng);
            dict[`layer${i}.mlp_fc1`] = this.createMatrix(4 * nEmbd, nEmbd, rng);
            dict[`layer${i}.mlp_fc2`] = this.createMatrix(nEmbd, 4 * nEmbd, rng);
        }
        return dict;
    }
}
