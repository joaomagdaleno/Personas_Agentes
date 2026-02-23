import { Value } from './microgpt_core.ts';

/**
 * 🏃 Optimizer — Handles Adam optimization steps.
 */
export class Optimizer {
    static applyAdam(params: Value[], adam: { m: Float64Array, v: Float64Array }, step: number, steps: number, lr: number) {
        const lrT = lr * (1 - step / steps);
        for (let i = 0; i < params.length; i++) {
            const p = params[i]!;
            adam.m[i] = 0.85 * adam.m[i]! + 0.15 * p.grad;
            adam.v[i] = 0.99 * adam.v[i]! + 0.01 * p.grad ** 2;
            const mHat = adam.m[i]! / (1 - Math.pow(0.85, step + 1));
            const vHat = adam.v[i]! / (1 - Math.pow(0.99, step + 1));
            p.data -= lrT * mHat / (Math.sqrt(vHat) + 1e-8);
            p.grad = 0;
        }
    }
}
